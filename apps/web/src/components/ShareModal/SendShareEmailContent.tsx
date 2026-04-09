"use client";

import { Typography } from "antd";
import styles from "./SendShareEmailContent.module.css";

export const SendShareEmailContent = () => (
  <Typography.Paragraph type="secondary" className={styles.root}>
    Sharing by email is not available yet.
  </Typography.Paragraph>
);
