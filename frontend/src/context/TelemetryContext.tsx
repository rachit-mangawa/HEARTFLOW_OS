"use client";

import { createContext, useContext, useEffect, useState } from "react";

type StreamState = {
  hr: number[];
  temp: number[];
};

type TelemetryContextType = {
  data: any;
  stream: StreamState;
};

const TelemetryContext = createContext<TelemetryContextType | null>(null);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>(null);
  const [stream, setStream] = useState<StreamState>({
    hr: Array(50).fill(75),
    temp: Array(50).fill(37.0)
  });

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/feed");
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setData(msg);
      if (msg?.sensor_data) {
        setStream(prev => ({
          hr: [...prev.hr.slice(1), msg.sensor_data.Heart_Rate],
          temp: [...prev.temp.slice(1), msg.sensor_data.Body_Temp]
        }));
      }
    };
    return () => ws.close();
  }, []);

  return (
    <TelemetryContext.Provider value={{ data, stream }}>
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
