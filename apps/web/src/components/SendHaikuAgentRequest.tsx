'use client';

import { notification } from 'antd';
import { runHaikuAgent } from '@/api/agents';
import { useEffect, useRef, useState } from 'react';
import styles from './HaikuGenerationChat/style.module.css';

export const SendHaikuAgentRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const [api, contextHolder] = notification.useNotification({ maxCount: 1 });

  const onError = () => {
    api.error({
      message: "Don't panic, but something went wrong",
      description:
        "Our slaves are working hard on fixing this issue. We will dispatch someone to hit them harder soon.\nPlease try again later.",
      placement: 'top',
      duration: 3,
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    try {
      setIsLoading(true);
      await runHaikuAgent(subject);
      setSubject('');
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send haiku agent request:", error);
      onError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} autoComplete="off" className={styles.shrine}>
      {/* Torii top kasagi beam */}
      <div className={styles.kasagi} />
      {/* Second beam (nuki) */}
      <div className={styles.nuki} />

      {/* Pillars + inner content */}
      <div className={styles.pillars}>
        <div className={styles.pillar} />

        <div className={styles.shrineInner}>
          <label className={styles.shrineLabel}>題 subject</label>
          <input
            ref={inputRef}
            className={styles.shrineInput}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
            placeholder="cherry blossoms..."
          />
          <button
            type="submit"
            className={styles.shrineButton}
            disabled={isLoading}
          >
            {isLoading ? '...' : '詠む — compose'}
          </button>
        </div>

        <div className={styles.pillar} />
      </div>

      {contextHolder}
    </form>
  );
};
