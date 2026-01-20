"use client";

import { useRef, useState } from "react";
import { formatChatTime } from "../utils/date";
import type { Response, ResponseStreamEvent, ResponseTextDeltaEvent, ResponseCreatedEvent } from "openai/resources/responses/responses";
import { useWebSocket } from "./useWebSocket";

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws";

export interface ChatLog {
  content: string;
  createdAt: string;
}

export const useHaikuSocket = () => {
const [chatLogs , setChatLogs] = useState<Record<string, ChatLog>>({});
const resetChat = () => {
    setChatLogs({});
};

const logMessage = (event: MessageEvent) => {
        try {
            const response: {data: ResponseStreamEvent, id: string} = JSON.parse(event?.data || "{}") || {};

            const { data, id } = response; 
            const eventType = data.type;

            setChatLogs((logs) => {
                const updatedLogs = { ...logs };
                if (eventType === 'response.created') {
                    const response: Response = data?.response;
                    const createdEpoch = response.created_at ? response.created_at * 1000 : Date.now();
                    updatedLogs[id] = {
                        createdAt: formatChatTime(new Date(createdEpoch)),
                        content: '',
                    };
                }

                if (eventType === 'response.output_text.delta') {
                    const delta = data?.delta || '';
                    logs[id].content = `${logs[id].content}${delta}`;
                }

                return updatedLogs;
            });

        } catch (error) {
            console.error("Failed to set WS message:", event.data, error);
        }
    };

    const { connected, send } = useWebSocket({
    url: SOCKET_URL,
    enabled: true,
    reconnect: true,
    onMessage: logMessage,
    });

  return {
    connected,
    chatLogs,
    resetChat,
    send,
  };
};
