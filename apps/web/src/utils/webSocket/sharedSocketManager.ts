import {
  WEB_SOCKET_URL,
  WEB_SOCKETS_DISABLED,
  WS_CLOSE_PONG_TIMEOUT,
  WS_IDLE_RELEASE_DELAY_MS,
  WS_SEND_QUEUE_LIMIT,
  WS_STABLE_CONNECTION_MS,
} from "@/consts/webSocket/webSocketConsts";
import { getTabId } from "@/utils/tabId";
import { createEmitter } from "./emitter";
import { createLivenessWatchdog } from "./livenessWatchdog";
import { reconnectDelayMs } from "./reconnectDelay";

const WS_OPEN = 1;

export type SharedSocketMessageListener = (event: MessageEvent, ws: WebSocket) => void;

type ResumeTarget = Pick<Window, "addEventListener"> & { document?: Pick<Document, "visibilityState"> };

export type SharedSocketDeps = {
  url: string;
  createSocket: (url: string, protocols: string[]) => WebSocket;
  getTabId: () => string;
  disabled?: boolean;
  random?: () => number;
  isOnline?: () => boolean;
  /** Where `online` / `visibilitychange` listeners go; omitted in tests. */
  windowTarget?: ResumeTarget;
};

type Timer = ReturnType<typeof setTimeout>;

const isPong = (data: unknown) => typeof data === "string" && data.startsWith('{"kind":"pong"');

const bindResumeTriggers = (target: ResumeTarget, resume: () => void) => {
  target.addEventListener("online", resume);
  target.addEventListener("visibilitychange", () => {
    if (target.document?.visibilityState === "visible") resume();
  });
};

/**
 * One WebSocket per page (tab) shared by every consumer: ref-counted, re-identified on login/logout,
 * kept alive by an app-level ping watchdog and reconnected with jittered exponential backoff.
 */
// eslint-disable-next-line max-lines-per-function -- one closure owns the socket lifecycle state
export function createSharedSocketManager(deps: SharedSocketDeps) {
  const random = deps.random ?? Math.random;
  const isOnline = deps.isOnline ?? (() => true);

  let consumers = 0;
  let identity: string | null = null;
  let ws: WebSocket | null = null;
  let attempt = 0;
  let hasOpened = false;
  let skipReconnectedEvent = false;
  let windowBound = false;
  let reconnectTimer: Timer | null = null;
  let idleTimer: Timer | null = null;
  let stableTimer: Timer | null = null;

  const queue: string[] = [];
  const messages = createEmitter<[MessageEvent, WebSocket]>();
  const opens = createEmitter<[WebSocket]>();
  const reconnects = createEmitter<[]>();
  const connection = createEmitter<[boolean]>();

  const isOpen = () => ws?.readyState === WS_OPEN;
  const shouldRun = () => !deps.disabled && consumers > 0 && identity !== null;

  const clearTimer = (timer: Timer | null) => {
    if (timer) clearTimeout(timer);
    return null;
  };

  /** Forgets the current socket immediately (no waiting for a close handshake on a dead connection). */
  const dropSocket = (code: number, reason: string) => {
    const socket = ws;
    if (!socket) return;
    ws = null;
    socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null;
    watchdog.stop();
    stableTimer = clearTimer(stableTimer);
    try {
      socket.close(code, reason);
    } catch {
      // already closed
    }
    connection.emit(false);
  };

  const scheduleReconnect = (closeCode: number | null) => {
    // Offline: the `online` event resumes immediately instead of burning backoff attempts.
    if (!shouldRun() || reconnectTimer || ws || !isOnline()) return;
    const delay = reconnectDelayMs(attempt, closeCode, random);
    attempt += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  };

  const watchdog = createLivenessWatchdog(() => {
    dropSocket(WS_CLOSE_PONG_TIMEOUT, "pong_timeout");
    scheduleReconnect(null);
  });

  const handleOpen = (socket: WebSocket) => {
    stableTimer = setTimeout(() => {
      attempt = 0;
    }, WS_STABLE_CONNECTION_MS);
    watchdog.start(socket);
    connection.emit(true);
    for (const message of queue.splice(0)) socket.send(message);
    opens.emit(socket);
    const isReconnect = hasOpened && !skipReconnectedEvent;
    hasOpened = true;
    skipReconnectedEvent = false;
    if (isReconnect) reconnects.emit();
  };

  const connect = () => {
    if (!shouldRun() || ws) return;
    reconnectTimer = clearTimer(reconnectTimer);
    const socket = deps.createSocket(deps.url, [`tabId.${deps.getTabId()}`]);
    ws = socket;
    socket.onopen = () => {
      if (socket === ws) handleOpen(socket);
    };
    socket.onmessage = (event: MessageEvent) => {
      if (socket !== ws) return;
      watchdog.heard();
      if (!isPong(event.data)) messages.emit(event, socket);
    };
    socket.onclose = (event: CloseEvent) => {
      if (socket !== ws) return;
      ws = null;
      watchdog.stop();
      stableTimer = clearTimer(stableTimer);
      connection.emit(false);
      scheduleReconnect(event.code);
    };
  };

  const resumeNow = () => {
    if (!shouldRun()) return;
    if (ws) return watchdog.ping();
    reconnectTimer = clearTimer(reconnectTimer);
    attempt = 0;
    connect();
  };

  const releaseConsumer = () => {
    consumers -= 1;
    if (consumers > 0) return;
    idleTimer = setTimeout(() => {
      idleTimer = null;
      if (consumers > 0) return;
      reconnectTimer = clearTimer(reconnectTimer);
      dropSocket(1000, "idle");
      hasOpened = false;
      attempt = 0;
    }, WS_IDLE_RELEASE_DELAY_MS);
  };

  return {
    /** Registers a consumer; the socket stays open while at least one is registered. */
    acquire(): () => void {
      consumers += 1;
      idleTimer = clearTimer(idleTimer);
      if (!windowBound && deps.windowTarget) bindResumeTriggers(deps.windowTarget, resumeNow);
      windowBound = true;
      connect();
      let released = false;
      return () => {
        if (!released) releaseConsumer();
        released = true;
      };
    },

    /** Login/logout changes the cookies the handshake carries, so the socket is re-established. */
    setIdentity(key: string) {
      if (key === identity) return;
      const hadIdentity = identity !== null;
      identity = key;
      if (hadIdentity) {
        skipReconnectedEvent = hasOpened;
        reconnectTimer = clearTimer(reconnectTimer);
        dropSocket(1000, "identity_change");
        attempt = 0;
      }
      connect();
    },

    send(data: unknown): boolean {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      if (ws && isOpen()) {
        ws.send(message);
        return true;
      }
      queue.push(message);
      if (queue.length > WS_SEND_QUEUE_LIMIT) queue.shift();
      return false;
    },

    subscribe: (listener: SharedSocketMessageListener) => messages.add(listener),

    /** Runs on every (re)open, and right away if the socket is already open. */
    addOpenHandler(handler: (ws: WebSocket) => void): () => void {
      if (ws && isOpen()) handler(ws);
      return opens.add(handler);
    },

    /** Fires when a lost connection is re-established (not on the first open or an identity switch). */
    onReconnected: (listener: () => void) => reconnects.add(listener),

    onConnectionChange: (listener: (connected: boolean) => void) => connection.add(listener),

    isConnected: isOpen,

    /** Resolves true once the socket is open, or false after `timeoutMs`. */
    whenOpen(timeoutMs: number): Promise<boolean> {
      if (isOpen()) return Promise.resolve(true);
      return new Promise((resolve) => {
        const off = opens.add(() => done(true));
        const timer = setTimeout(() => done(false), timeoutMs);
        function done(value: boolean) {
          clearTimeout(timer);
          off();
          resolve(value);
        }
      });
    },
  };
}

export type SharedSocketManager = ReturnType<typeof createSharedSocketManager>;

let sharedSocket: SharedSocketManager | null = null;

export const getSharedSocket = (): SharedSocketManager => {
  if (sharedSocket) return sharedSocket;
  const inBrowser = typeof window !== "undefined";
  sharedSocket = createSharedSocketManager({
    url: WEB_SOCKET_URL,
    createSocket: (url, protocols) => new WebSocket(url, protocols),
    getTabId,
    disabled: WEB_SOCKETS_DISABLED || !inBrowser,
    isOnline: () => !inBrowser || navigator.onLine !== false,
    windowTarget: inBrowser ? window : undefined,
  });
  return sharedSocket;
};
