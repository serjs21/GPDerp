/** Centre (rem, relative to the toggle box) and clockwise tilt of the clap burst. */
export type PasswordClapPlacement = { cx: number; cy: number; deg: number };

export type PasswordClap = { id: number; placement: PasswordClapPlacement; color: string };

export type PasswordClapBurstProps = {
  clap: PasswordClap | null;
  onClapDone: () => void;
};
