export type CharacterItem = { el: HTMLSpanElement; seed: number; index: number; total: number };
export type CharacterLayout = { item: CharacterItem; x: number; y: number; halfW: number; halfH: number };

export const BASE_SPIN_TURNS = 2.8;
export const SPIRAL_SWEEP_RAD = Math.PI * 1.1;
