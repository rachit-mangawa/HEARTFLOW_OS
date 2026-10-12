import { useEffect, useRef, useState } from "react";

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

export function useResilientSocket<T>(url: string, onMessage: (msg: T) => void): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);
  const savedCallback = useRef(onMessage);

  useEffect(() => {
    savedCallback.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!url) {
      const timer = setTimeout(() => setStatus("disconnected"), 0);
      return () => clearTimeout(timer);
    }

    let ws: WebSocket;
    let isComponentMounted = true;

    const connect = () => {
      try {
        ws = new WebSocket(url);
      } catch {
        setStatus("disconnected");
        return;
      }

      ws.onopen = () => {
        if (!isComponentMounted) return;
        setStatus("connected");
        reconnectAttemptRef.current = 0; // Reset attempts
      };

      ws.onmessage = (event: MessageEvent) => {
        if (!isComponentMounted) return;
        try {
          const msg = JSON.parse(event.data) as T;
          savedCallback.current(msg);
        } catch {
          // ignore malformed frame
        }
      };

      ws.onclose = () => {
        if (!isComponentMounted) return;
        setStatus("reconnecting");
        const timeout = Math.min(1000 * 2 ** reconnectAttemptRef.current, 30000); // Max 30s
        reconnectAttemptRef.current += 1;

        reconnectTimeoutRef.current = setTimeout(connect, timeout);
      };

      ws.onerror = () => {
        if (!isComponentMounted) return;
        try {
          ws.close();
        } catch {
          // ignore already closed
        }
      };
    };

    connect();

    return () => {
      isComponentMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (ws) {
        try {
          ws.close();
        } catch {
          // ignore
        }
      }
    };
  }, [url]);

  return status;
}
