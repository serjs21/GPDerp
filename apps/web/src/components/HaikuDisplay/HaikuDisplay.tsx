"use client";

import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { ChatLog } from "@/hooks/useHaikuSocket";
import { StreamText } from "../StreamText";
import styles from "./styles.module.css";

interface HaikuDisplayProps {
  chatLogs: Record<string, ChatLog>;
}

const EntryCard = ({
  log,
  containerRef,
}: {
  log: ChatLog;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  // Gentle scale pop: small at edges, full size in the middle
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.85]);

  // Soft fade at the very edges only
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.5, 1, 1, 1]);

  return (
    <motion.div
      ref={ref}
      className={styles.entry}
      // style={{ scale, opacity }}
      initial={{ opacity: 0, x: -100, y: -20, minHeight: 0, height: 0 }}
      animate={{ opacity: 1, x: 0, y: 0, minHeight: "185px", height: "fit-content" }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.cloud}>
      <StreamText text={`${log.createdAt}: ${log.subject} \n\n`} />
      <div className={styles.content}>{log.content}</div>
      </div>
    </motion.div>
  );
};

export const HaikuDisplay = ({ chatLogs }: HaikuDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const sortedEntries = useMemo(
    () => Object.entries(chatLogs).reverse(),
    [chatLogs]
  );

  return (
    <div ref={containerRef} className={styles.haikuDisplay}>
      {sortedEntries.map(([id, log]) => (
        <EntryCard
          key={id}
          log={log}
          containerRef={containerRef}
        />
      ))}
    </div>
  );
};
