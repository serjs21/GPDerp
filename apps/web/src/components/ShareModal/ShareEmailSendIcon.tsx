"use client";

import { motion } from "motion/react";
import { SEND_ICON_MOTION } from "./consts/shareEmailSendConsts";
import type { ShareEmailSendIconProps } from "./ShareEmailSendPanel.types";
import styles from "./ShareEmailSendPanel.module.css";

/** Envelope icon that wobbles while the postcard is in flight. */
export function ShareEmailSendIcon({ flying }: ShareEmailSendIconProps) {
  const motionProps = flying ? SEND_ICON_MOTION.flying : SEND_ICON_MOTION.rest;
  return (
    <motion.span className={styles.iconWrap} animate={motionProps.animate} transition={motionProps.transition}>
      <img src="/share_modal/email_send.svg" alt="" className={styles.icon} />
    </motion.span>
  );
}
