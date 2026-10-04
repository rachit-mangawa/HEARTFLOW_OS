import { useEffect, useRef, useState } from "react";

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export function useResilientSocket(url: string, onMessage: (msg: any) => void) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);
  const savedCallback = useRef(onMessage);

  useEffect(() => {
    savedCallback.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let ws: WebSocket;
    let isComponentMounted = true;

    const connect = () => {
      ws = new WebSocket(url);
      
      ws.onopen = () => {
        if (!isComponentMounted) return;
        setStatus('connected');
        reconnectAttemptRef.current = 0; // Reset attempts
      };

      ws.onmessage = (event) => {
        if (!isComponentMounted) return;
        const msg = JSON.parse(event.data);
        savedCallback.current(msg);
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
  }, [url]);

  return status;
}
