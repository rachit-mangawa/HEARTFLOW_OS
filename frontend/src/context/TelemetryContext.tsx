"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useResilientSocket, ConnectionStatus } from "@/hooks/useResilientSocket";

type StreamState = {
  hr: number[];
  temp: number[];
};

type TelemetryContextType = {
  data: any;
  stream: StreamState;
  status: ConnectionStatus;
};

const TelemetryContext = createContext<TelemetryContextType | null>(null);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>(null);
  const [stream, setStream] = useState<StreamState>({
    hr: Array(50).fill(75),
    temp: Array(50).fill(37.0)
  });

  const handleMessage = useCallback((msg: any) => {
    setData(msg);
    if (msg?.sensor_data) {
      setStream(prev => ({
        hr: [...prev.hr.slice(1), msg.sensor_data.Heart_Rate],
        temp: [...prev.temp.slice(1), msg.sensor_data.Body_Temp]
      }));
    }
  }, []);

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/feed";
  const status = useResilientSocket(wsUrl, handleMessage);

  return (
    <TelemetryContext.Provider value={{ data, stream, status }}>
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
