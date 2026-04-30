'use client';

import { useEffect, useState } from 'react';
import styles from './styles.module.css';

export interface WritingLoaderProps {
    variant?: keyof typeof VARIANT_EMOJIS;
}

const DOTS = ["", ".", "..", "..."];

const VARIANT_EMOJIS = {
    feather: '🪶',
    pen: '🖊️',
    paintbrush: '🖌️',
    hand: '✍️',
    fountain_pen: '🖋️',
    crayon: '🖍️',
};


export const WritingLoader = ({ variant = 'feather' }: WritingLoaderProps) => {
    const [dotIndex, setDotIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotIndex((prev) => (prev + 1) % DOTS.length);
        }, 500);
        return () => clearInterval(interval);
    }, []);
  return <div className={styles.container}>{DOTS[dotIndex]} <span className={styles.writing}>{VARIANT_EMOJIS[variant]}</span></div>;
}