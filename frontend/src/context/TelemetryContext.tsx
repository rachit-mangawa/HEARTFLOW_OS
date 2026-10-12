"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { useResilientSocket, ConnectionStatus } from "@/hooks/useResilientSocket";
import { globalSimulator } from "@/lib/edge/simulator";
import { appendSessionHistory } from "@/lib/edge/history";
import { evaluateEdge } from "@/lib/edge/inference";
import { TelemetryPacket, PatientVitals } from "@/lib/edge/types";
import {
  connectWebSerial,
  startSiliconLoopback,
  SerialConnectionStatus,
  SerialBridgeHandle,
} from "@/lib/edge/serial";

const emptySubscribe = () => () => {};
const getClientSerialSnapshot = () => typeof window !== "undefined" && "serial" in navigator;
const getServerSerialSnapshot = () => false;

type StreamState = {
  hr: number[];
  temp: number[];
};

export type RuntimeSourceMode = "EDGE_WASM_BROWSER" | "CLOUD_FASTAPI" | "SERIAL_ESP32_HARDWARE" | "SILICON_LOOPBACK";

type TelemetryContextType = {
  data: TelemetryPacket | null;
  stream: StreamState;
  status: ConnectionStatus | "edge_active" | "serial_connected";
  runtimeMode: RuntimeSourceMode;
  serialStatus: SerialConnectionStatus;
  serialMessage: string;
  isWebSerialSupported: boolean;
  connectHardwareSerial: () => Promise<void>;
  engageSiliconLoopback: () => void;
  disconnectSerial: () => void;
  snapshotCurrentVitals: (customLabel?: string) => void;
};

const TelemetryContext = createContext<TelemetryContextType | null>(null);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<TelemetryPacket | null>(null);
  const [stream, setStream] = useState<StreamState>({
    hr: Array(50).fill(75),
    temp: Array(50).fill(37.0),
  });
  const [runtimeMode, setRuntimeMode] = useState<RuntimeSourceMode>("EDGE_WASM_BROWSER");
  const [isEdgeFallback, setIsEdgeFallback] = useState(true);

  // Serial Bridge State
  const serialHandleRef = useRef<SerialBridgeHandle | null>(null);
  const [serialStatus, setSerialStatus] = useState<SerialConnectionStatus>("idle");
  const [serialMessage, setSerialMessage] = useState("");
  const webSerialSupported = useSyncExternalStore(
    emptySubscribe,
    getClientSerialSnapshot,
    getServerSerialSnapshot
  );

  const updatePacketStream = useCallback((packet: TelemetryPacket) => {
    setData(packet);
    if (packet.sensor_data) {
      setStream((prev) => ({
        hr: [...prev.hr.slice(1), packet.sensor_data.Heart_Rate],
        temp: [...prev.temp.slice(1), packet.sensor_data.Body_Temp],
      }));
    }
  }, []);

  const handleMessage = useCallback((msg: TelemetryPacket) => {
    setRuntimeMode("CLOUD_FASTAPI");
    updatePacketStream(msg);
  }, [updatePacketStream]);

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "";
  const cloudStatus = useResilientSocket(wsUrl, handleMessage);

  // Monitor cloud connection status
  useEffect(() => {
    if (!wsUrl || cloudStatus !== "connected") {
      const timer = setTimeout(() => {
        setIsEdgeFallback(true);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsEdgeFallback(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [wsUrl, cloudStatus]);

  // Run in-browser Edge Simulator when in fallback mode and not on serial
  useEffect(() => {
    if (!isEdgeFallback || serialStatus === "connected" || serialStatus === "loopback") return;

    const timer = setTimeout(() => {
      setRuntimeMode("EDGE_WASM_BROWSER");
    }, 0);

    const unsubscribe = globalSimulator.subscribe((packet: TelemetryPacket) => {
      updatePacketStream(packet);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [isEdgeFallback, serialStatus, updatePacketStream]);

  // Ingest vitals from Serial hardware or Silicon loopback
  const handleSerialVitals = useCallback((vitals: PatientVitals) => {
    const edgeRes = evaluateEdge(vitals);
    const packet: TelemetryPacket = {
      sensor_data: vitals,
      prediction: {
        is_at_risk: edgeRes.is_at_risk,
        label: edgeRes.label,
        confidence: edgeRes.confidence,
        disease_probs: edgeRes.disease_probs,
        inference_latency_us: edgeRes.latency_us,
      },
      runtime_mode: "EDGE_WASM_BROWSER",
    };
    updatePacketStream(packet);
  }, [updatePacketStream]);

  const connectHardwareSerial = useCallback(async () => {
    if (serialHandleRef.current) {
      serialHandleRef.current.disconnect();
    }
    try {
      const handle = await connectWebSerial(
        (vitals) => handleSerialVitals(vitals),
        (status, msg) => {
          setSerialStatus(status);
          setSerialMessage(msg);
          if (status === "connected") {
            setRuntimeMode("SERIAL_ESP32_HARDWARE");
          }
        }
      );
      serialHandleRef.current = handle;
    } catch {
      // Caught in connectWebSerial
    }
  }, [handleSerialVitals]);

  const engageSiliconLoopback = useCallback(() => {
    if (serialHandleRef.current) {
      serialHandleRef.current.disconnect();
    }
    const handle = startSiliconLoopback(
      (vitals) => handleSerialVitals(vitals),
      (status, msg) => {
        setSerialStatus(status);
        setSerialMessage(msg);
        if (status === "loopback") {
          setRuntimeMode("SILICON_LOOPBACK");
        }
      }
    );
    serialHandleRef.current = handle;
  }, [handleSerialVitals]);

  const disconnectSerial = useCallback(() => {
    if (serialHandleRef.current) {
      serialHandleRef.current.disconnect();
      serialHandleRef.current = null;
    }
    setSerialStatus("idle");
    setSerialMessage("SERIAL_DISCONNECTED");
    setRuntimeMode(isEdgeFallback ? "EDGE_WASM_BROWSER" : "CLOUD_FASTAPI");
  }, [isEdgeFallback]);

  const snapshotCurrentVitals = useCallback((customLabel?: string) => {
    if (!data?.sensor_data) return;
    appendSessionHistory({
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      heart_rate: data.sensor_data.Heart_Rate,
      spo2: data.sensor_data.SpO2_Level,
      sys_bp: data.sensor_data.Systolic_BP,
      dia_bp: data.sensor_data.Diastolic_BP,
      body_temp: data.sensor_data.Body_Temp,
      prediction_label: customLabel || data.prediction?.label || "Manual Snapshot",
      confidence: data.prediction?.confidence ?? 0.95,
      is_at_risk: Boolean(data.prediction?.is_at_risk),
    });
  }, [data]);

  const effectiveStatus = serialStatus === "connected"
    ? "serial_connected"
    : isEdgeFallback
    ? "edge_active"
    : cloudStatus;

  return (
    <TelemetryContext.Provider
      value={{
        data,
        stream,
        status: effectiveStatus,
        runtimeMode,
        serialStatus,
        serialMessage,
        isWebSerialSupported: webSerialSupported,
        connectHardwareSerial,
        engageSiliconLoopback,
        disconnectSerial,
        snapshotCurrentVitals,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
