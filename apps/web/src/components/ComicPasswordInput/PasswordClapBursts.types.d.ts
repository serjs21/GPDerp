/** Centre (rem, relative to the toggle box) and clockwise tilt of one clap burst. */
export type PasswordClapPlacement = { cx: number; cy: number; deg: number };

export type PasswordClap = { id: number; placement: PasswordClapPlacement; color: string };

export type PasswordClapBurstsProps = {
  claps: PasswordClap[];
  onClapDone: (id: number) => void;
};
