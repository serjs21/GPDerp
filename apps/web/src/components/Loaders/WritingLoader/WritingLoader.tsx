'use client';

import { useEffect, useState } from 'react';
import styles from './styles.module.css';

export interface WritingLoaderProps {
    variant?: keyof typeof VARIANT_EMOJIS;
}

const VARIANT_EMOJIS = {
    feather: '🪶',
    pen: '🖊️',
    paintbrush: '🖌️',
    hand: '✍️',
    fountain_pen: '🖋️',
    crayon: '🖍️',
};


export const WritingLoader = ({ variant = 'feather' }: WritingLoaderProps) => {
    const dots = ['', '.', '..', '...'];
    const [dotIndex, setDotIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotIndex((prev) => (prev + 1) % dots.length);
        }, 500);
        return () => clearInterval(interval);
    }, []);
  return <div className={styles.container}>{dots[dotIndex]} <span className={styles.writing}>{VARIANT_EMOJIS[variant]}</span></div>;
}