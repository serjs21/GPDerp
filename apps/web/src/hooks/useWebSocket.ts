import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { getSharedSocket } from "@/utils/webSocket/sharedSocketManager";

type UseWebSocketOptions = {
  /** While false this consumer does not hold the tab's shared socket open. */
  enabled?: boolean;
  onMessage?: (event: MessageEvent, ws: WebSocket) => void;
  /** Runs on every (re)open, and right away if the shared socket is already open. */
  onOpen?: (ws: WebSocket) => void;
};

type UseWebSocketReturn = {
  connected: boolean;
  send: (data: unknown) => boolean;
};

const subscribeConnection = (onChange: () => void) => getSharedSocket().onConnectionChange(onChange);
const readConnected = () => getSharedSocket().isConnected();
const readConnectedOnServer = () => false;

/** Subscribes to the tab's single shared WebSocket (see `sharedSocketManager`). */
export function useWebSocket({ enabled = true, onMessage, onOpen }: UseWebSocketOptions): UseWebSocketReturn {
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  const socketConnected = useSyncExternalStore(subscribeConnection, readConnected, readConnectedOnServer);

  useEffect(() => {
    if (!enabled) return;
    const socket = getSharedSocket();
    const offMessage = socket.subscribe((event, ws) => onMessageRef.current?.(event, ws));
    const offOpen = socket.addOpenHandler((ws) => onOpenRef.current?.(ws));
    const release = socket.acquire();
    return () => {
      offMessage();
      offOpen();
      release();
    };
  }, [enabled]);

  const send = useCallback((data: unknown) => getSharedSocket().send(data), []);

  return { connected: enabled && socketConnected, send };
}
