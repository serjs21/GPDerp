"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { StreamText } from "../StreamText";
import { SendHaikuAgentRequest } from "./SendHaikuAgentRequest";
import { useHaikuSocket } from "@/hooks/useHaikuSocket";
import styles from "./style.module.css";
import { HaikuDisplay } from "../HaikuDisplay/HaikuDisplay";
import { Pillars } from "../Dividers";

const THRESHOLD = 80; 


export const HaikuGenerationChat = () => {
  const { chatLogs } = useHaikuSocket();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Smooth scroll only if user is already near bottom
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD;

    if (isNearBottom) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatLogs]);

  return (
    <div className={`${styles.chatWrapper}`} ref={containerRef}>
      <SendHaikuAgentRequest />
        <HaikuDisplay chatLogs={chatLogs} />
    </div>
  );
};
