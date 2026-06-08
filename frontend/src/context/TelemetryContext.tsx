"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useResilientSocket, ConnectionStatus } from "@/hooks/useResilientSocket";
import { globalSimulator } from "@/lib/edge/simulator";
import { appendLocalHistory } from "@/lib/edge/history";
import { TelemetryPacket } from "@/lib/edge/types";

type StreamState = {
  hr: number[];
  temp: number[];
};

type TelemetryContextType = {
  data: any;
  stream: StreamState;
  status: ConnectionStatus | 'edge_active';
  runtimeMode: 'EDGE_WASM_BROWSER' | 'CLOUD_FASTAPI';
  snapshotCurrentVitals: (customLabel?: string) => void;
};

const TelemetryContext = createContext<TelemetryContextType | null>(null);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>(null);
  const [stream, setStream] = useState<StreamState>({
    hr: Array(50).fill(75),
    temp: Array(50).fill(37.0)
  });
  const [runtimeMode, setRuntimeMode] = useState<'EDGE_WASM_BROWSER' | 'CLOUD_FASTAPI'>('EDGE_WASM_BROWSER');
  const [isEdgeFallback, setIsEdgeFallback] = useState(false);

  const handleMessage = useCallback((msg: any) => {
    setData(msg);
    setRuntimeMode('CLOUD_FASTAPI');
    if (msg?.sensor_data) {
      setStream(prev => ({
        hr: [...prev.hr.slice(1), msg.sensor_data.Heart_Rate],
        temp: [...prev.temp.slice(1), msg.sensor_data.Body_Temp]
      }));
    }
  }, []);

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "";
  const cloudStatus = useResilientSocket(wsUrl, handleMessage);

  // If cloud WebSocket is not configured or in reconnecting state, automatically engage browser Edge AI
  useEffect(() => {
    if (!wsUrl || cloudStatus !== 'connected') {
      const timer = setTimeout(() => {
        setIsEdgeFallback(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsEdgeFallback(false);
    }
  }, [wsUrl, cloudStatus]);

  // Run in-browser Edge Simulator when in fallback mode
  useEffect(() => {
    if (!isEdgeFallback) return;

    setRuntimeMode('EDGE_WASM_BROWSER');
    const unsubscribe = globalSimulator.subscribe((packet: TelemetryPacket) => {
      setData(packet);
      if (packet.sensor_data) {
        setStream(prev => ({
          hr: [...prev.hr.slice(1), packet.sensor_data.Heart_Rate],
          temp: [...prev.temp.slice(1), packet.sensor_data.Body_Temp]
        }));
      }
    });

    return () => unsubscribe();
  }, [isEdgeFallback]);

  const snapshotCurrentVitals = useCallback((customLabel?: string) => {
    if (!data?.sensor_data) return;
    appendLocalHistory({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      heart_rate: data.sensor_data.Heart_Rate,
      spo2: data.sensor_data.SpO2_Level,
      sys_bp: data.sensor_data.Systolic_BP,
      dia_bp: data.sensor_data.Diastolic_BP,
      body_temp: data.sensor_data.Body_Temp,
      prediction_label: customLabel || data.prediction?.label || "Manual Snapshot",
      confidence: data.prediction?.confidence ?? 0.95,
      is_at_risk: Boolean(data.prediction?.is_at_risk)
    });
  }, [data]);

  const effectiveStatus = isEdgeFallback ? 'edge_active' : cloudStatus;

  return (
    <TelemetryContext.Provider value={{ data, stream, status: effectiveStatus, runtimeMode, snapshotCurrentVitals }}>
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

