"use client";

import { SendHaikuAgentRequest } from './SendHaikuAgentRequest';
import { useHaikuSocket } from '@/hooks/useHaikuSocket';

export const SocketStatusDisplay = () => {
    const { connected, chatLogs } = useHaikuSocket();

  return (
    <div style={{ padding: 16, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
       <SendHaikuAgentRequest />

      <div style={{ marginTop: 16, padding: 8, border: "1px solid #ccc", height: 200, overflow: "auto", width: "600px"}}>
    {Object.entries(chatLogs).map(([id, log]) => (
          <div key={id} style={{ marginBottom: 8 }}>
            <strong>{log.createdAt}</strong>: {log.content}
          </div>
        ))}
      </div>
    </div>
  );
}