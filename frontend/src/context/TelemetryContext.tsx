"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";

type StreamState = {
  hr: number[];
  temp: number[];
};

type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

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
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);

  useEffect(() => {
    let ws: WebSocket;
    let isComponentMounted = true;

    const connect = () => {
      ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/feed");
      
      ws.onopen = () => {
        if (!isComponentMounted) return;
        setStatus('connected');
        reconnectAttemptRef.current = 0; // Reset attempts
      };

      ws.onmessage = (event) => {
        if (!isComponentMounted) return;
        const msg = JSON.parse(event.data);
        setData(msg);
        if (msg?.sensor_data) {
          setStream(prev => ({
            hr: [...prev.hr.slice(1), msg.sensor_data.Heart_Rate],
            temp: [...prev.temp.slice(1), msg.sensor_data.Body_Temp]
          }));
        }
      };

      ws.onclose = () => {
        if (!isComponentMounted) return;
        setStatus('reconnecting');
        const timeout = Math.min(1000 * (2 ** reconnectAttemptRef.current), 30000); // Max 30s
        reconnectAttemptRef.current += 1;
        
        reconnectTimeoutRef.current = setTimeout(connect, timeout);
      };

      ws.onerror = () => {
        if (!isComponentMounted) return;
        ws.close(); // Force trigger onclose
      };
    };

    connect();

    return () => {
      isComponentMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (ws) ws.close();
    };
  }, []);

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
