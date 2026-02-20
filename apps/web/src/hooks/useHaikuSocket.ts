"use client";

import { useCallback, useState } from "react";
import { formatChatTime } from "../utils/date";
import { useWebSocket } from "./useWebSocket";

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws";

export interface ChatLog {
  content: string;
  createdAt: string;
  subject: string;
}

export const useHaikuSocket = () => {
const [chatLogs , setChatLogs] = useState<Record<string, ChatLog>>({});
const resetChat = () => {
    setChatLogs({});
};

const logMessage = useCallback((event: MessageEvent) => {
        try {
            const response: {data: {delta?: string, subject: string}, id: string} = JSON.parse(event?.data || "{}") || {};
            const { data, id } = response; 

            setChatLogs((logs) => {
                const updatedLogs = { ...logs };
                if (!updatedLogs[id]) {
                    updatedLogs[id] = {
                        createdAt: formatChatTime(new Date()),
                        content: '',
                        subject: data.subject,
                    };
                }

                const delta = data?.delta || '';
                updatedLogs[id] =  {...updatedLogs[id], content: updatedLogs[id].content + delta};
                return updatedLogs;
            });

        } catch (error) {
            console.error("Failed to set WS message:", event.data, error);
        }
    }, []);

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
