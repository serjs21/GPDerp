"use client";

import type { FunctionComponent } from "react";
import { useWebSocketSession } from "@/hooks/useWebSocketSession";
import type { WebSocketSessionSyncProps } from "./WebSocketSessionSync.types";

export const WebSocketSessionSync: FunctionComponent<WebSocketSessionSyncProps> = () => {
  useWebSocketSession();
  return null;
};
