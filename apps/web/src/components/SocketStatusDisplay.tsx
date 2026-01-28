"use client";

import { ChunkyText } from './ChunkyText';
import { SendHaikuAgentRequest } from './SendHaikuAgentRequest';
import { useHaikuSocket } from '@/hooks/useHaikuSocket';

export const SocketStatusDisplay = () => {
    const { chatLogs } = useHaikuSocket();

  return (
    <div style={{ padding: 16, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
       <SendHaikuAgentRequest />

      <div style={{ marginTop: '16px', border: "1px solid #ccc", height: 'auto', maxHeight: '80vh', overflow: "auto", width: "400px", whiteSpace: "pre-wrap", display: "flex", flexDirection: "column", gap: "16px", padding: "16px" }}>
    {Object.entries(chatLogs).map(([id, log]) => (
          <div key={id} style={{ marginBottom: 8 }}>
            <strong style={{fontSize: '16px'}} ><ChunkyText text={`${log.createdAt}: ${log.subject} \n\n`} /></strong>
             {log.content}
            <br/>
          </div>
        ))}
      </div>
    </div>
  );
}