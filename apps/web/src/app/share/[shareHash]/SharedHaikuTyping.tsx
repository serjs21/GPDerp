"use client";

import { TextTyping } from "@/components/TextTyping/TextTyping";
import styles from "./SharedHaikuTyping.module.css";

type SharedHaikuTypingProps = {
  title: string;
  body: string;
};

export const SharedHaikuTyping = ({ title, body }: SharedHaikuTypingProps) => {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>
        <TextTyping text={title} />
      </h1>
      <p className={styles.body}>
        <TextTyping text={body} />
      </p>
    </div>
  );
};
