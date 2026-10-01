import { getTabId } from "@/utils/tabId";
import { useEffect, useRef, useState, useCallback } from "react";

// Storybook sets this so stories never open sockets to the real API.
const WEBSOCKETS_DISABLED = process.env.NEXT_PUBLIC_WS_DISABLED === "true";

type UseWebSocketOptions = {
  url: string;
  protocols?: string | string[];
  enabled?: boolean; // allow turning it on/off
  reconnect?: boolean;
  minReconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
  onMessage?: (event: MessageEvent, ws: WebSocket) => void;
  onOpen?: (ws: WebSocket) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
};

type UseWebSocketReturn = {
  ws: WebSocket | null;
  connected: boolean;
  send: (data: unknown) => boolean;
  close: (code?: number, reason?: string) => void;
  reconnectNow: () => void;
};

export function useWebSocket({
  url,
  protocols,
  enabled: enabledOption = true,
  reconnect = true,
  minReconnectDelayMs = 250,
  maxReconnectDelayMs = 8000,
  onMessage,
  onOpen,
  onClose,
  onError,
}: UseWebSocketOptions): UseWebSocketReturn {
  const enabled = enabledOption && !WEBSOCKETS_DISABLED;
  const wsRef = useRef<WebSocket | null>(null);

  // keep latest callbacks without re-creating socket
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onOpenRef.current = onOpen; }, [onOpen]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const [connected, setConnected] = useState(false);

  const shouldRunRef = useRef(false);
  const retryCountRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const connectRef = useRef<() => void>(() => {});

  // Queue messages until socket is OPEN
  const sendQueueRef = useRef<string[]>([]);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const safeCloseCurrent = (code = 1000, reason = "client_close") => {
    const ws = wsRef.current;
    if (!ws) return;
    wsRef.current = null;

    try {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      ws.close(code, reason);
    } catch {
      // ignore
    }
  };

  const flushQueue = (ws: WebSocket) => {
    if (ws.readyState !== WebSocket.OPEN) return;
    const q = sendQueueRef.current;
    if (!q.length) return;
    for (const msg of q) ws.send(msg);
    sendQueueRef.current = [];
  };

  const connect = useCallback(() => {
    if (!enabled) return;
    if (!shouldRunRef.current) return;

    // Ensure single active socket
    safeCloseCurrent(1000, "reinit");
    const ws = new WebSocket(url, [...(Array.isArray(protocols) ? protocols : protocols ? [protocols] : []), `tabId.${getTabId()}`]);
    wsRef.current = ws;
    ws.onopen = () => {
      retryCountRef.current = 0;
      setConnected(true);
      onOpenRef.current?.(ws);
      flushQueue(ws);
    };

    ws.onmessage = (ev) => {
      onMessageRef.current?.(ev, ws);
    };

    ws.onerror = (ev) => {
      onErrorRef.current?.(ev);
      // Let onclose drive reconnection; some browsers fire error before close
    };

    ws.onclose = (ev) => {
      setConnected(false);
      onCloseRef.current?.(ev);

      if (!shouldRunRef.current) return;
      if (!reconnect) return;

      // Exponential backoff with cap
      const delay = Math.min(
        minReconnectDelayMs * 2 ** retryCountRef.current,
        maxReconnectDelayMs
      );
      retryCountRef.current += 1;

      clearReconnectTimer();
      reconnectTimerRef.current = window.setTimeout(() => {
        connectRef.current();
      }, delay);
    };
  // url/protocols/enabled/reconnect delays are safe deps because connect is used by effect
  }, [url, protocols, enabled, reconnect, minReconnectDelayMs, maxReconnectDelayMs]);
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // lifecycle: start/stop
  useEffect(() => {
    shouldRunRef.current = true;

    if (enabled) connect();

    return () => {
      shouldRunRef.current = false;
      clearReconnectTimer();
      setConnected(false);
      safeCloseCurrent(1000, "unmount");
    };
  }, [enabled, connect]);

  const send = useCallback((data: unknown) => {
    const ws = wsRef.current;
    const msg = typeof data === "string" ? data : JSON.stringify(data);

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      // queue and attempt connect (optional)
      sendQueueRef.current.push(msg);
      if (enabled && shouldRunRef.current && (!ws || ws.readyState === WebSocket.CLOSED)) {
        connect();
      }
      return false;
    }

    ws.send(msg);
    return true;
  }, [connect, enabled]);

  const close = useCallback((code?: number, reason?: string) => {
    shouldRunRef.current = false;
    clearReconnectTimer();
    safeCloseCurrent(code ?? 1000, reason ?? "manual_close");
    setConnected(false);
  }, []);

  const reconnectNow = useCallback(() => {
    if (!enabled) return;
    shouldRunRef.current = true;
    retryCountRef.current = 0;
    clearReconnectTimer();
    connect();
  }, [connect, enabled]);

  return {
    ws: null,
    connected,
    send,
    close,
    reconnectNow,
  };
}
