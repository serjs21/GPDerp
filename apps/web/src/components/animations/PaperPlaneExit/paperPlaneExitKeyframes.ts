/** CSS custom-property values for the Aaron Iker paper-plane fold (numeric units applied in CSS). */
export type PaperPlaneVars = {
  rotate: number;
  planeX: number;
  planeY: number;
  planeOpacity: number;
  textOpacity: number;
  borderRadius: number;
  leftWingFirstX: number;
  leftWingFirstY: number;
  leftWingSecondX: number;
  leftWingSecondY: number;
  leftWingThirdX: number;
  leftWingThirdY: number;
  leftBodyFirstX: number;
  leftBodyFirstY: number;
  leftBodySecondX: number;
  leftBodySecondY: number;
  leftBodyThirdX: number;
  leftBodyThirdY: number;
  rightWingFirstX: number;
  rightWingFirstY: number;
  rightWingSecondX: number;
  rightWingSecondY: number;
  rightWingThirdX: number;
  rightWingThirdY: number;
  rightBodyFirstX: number;
  rightBodyFirstY: number;
  rightBodySecondX: number;
  rightBodySecondY: number;
  rightBodyThirdX: number;
  rightBodyThirdY: number;
};

export const PAPER_PLANE_FOLD_MS = 950;
export const PAPER_PLANE_FLY_MS = 1400;
export const PAPER_PLANE_EXIT_DURATION_MS = PAPER_PLANE_FOLD_MS + PAPER_PLANE_FLY_MS;

export const INITIAL_PLANE_VARS: PaperPlaneVars = {
  rotate: 0,
  planeX: 0,
  planeY: 0,
  planeOpacity: 0,
  textOpacity: 1,
  borderRadius: 2,
  leftWingFirstX: 0,
  leftWingFirstY: 0,
  leftWingSecondX: 50,
  leftWingSecondY: 0,
  leftWingThirdX: 0,
  leftWingThirdY: 100,
  leftBodyFirstX: 50,
  leftBodyFirstY: 0,
  leftBodySecondX: 50,
  leftBodySecondY: 100,
  leftBodyThirdX: 0,
  leftBodyThirdY: 100,
  rightWingFirstX: 50,
  rightWingFirstY: 0,
  rightWingSecondX: 100,
  rightWingSecondY: 0,
  rightWingThirdX: 100,
  rightWingThirdY: 100,
  rightBodyFirstX: 50,
  rightBodyFirstY: 0,
  rightBodySecondX: 50,
  rightBodySecondY: 100,
  rightBodyThirdX: 100,
  rightBodyThirdY: 100,
};

export type FoldKeyframeStep = {
  duration: number;
  to: Partial<PaperPlaneVars>;
  setAfter?: Partial<PaperPlaneVars>;
};

/** Ported from https://codepen.io/aaroniker/pen/NWGZzXx */
export const FOLD_KEYFRAMES: FoldKeyframeStep[] = [
  {
    duration: 200,
    to: {
      textOpacity: 0,
      planeOpacity: 1,
      borderRadius: 0,
      leftWingFirstX: 50,
      leftWingFirstY: 100,
      rightWingSecondX: 50,
      rightWingSecondY: 100,
    },
    setAfter: {
      leftWingFirstY: 0,
      leftWingSecondX: 40,
      leftWingSecondY: 100,
      leftWingThirdX: 0,
      leftWingThirdY: 100,
      leftBodyThirdX: 40,
      rightWingFirstX: 50,
      rightWingFirstY: 0,
      rightWingSecondX: 60,
      rightWingSecondY: 100,
      rightWingThirdX: 100,
      rightWingThirdY: 100,
      rightBodyThirdX: 60,
    },
  },
  {
    duration: 200,
    to: {
      leftWingThirdX: 20,
      leftWingThirdY: 90,
      leftWingSecondY: 90,
      leftBodyThirdY: 90,
      rightWingThirdX: 80,
      rightWingThirdY: 90,
      rightBodyThirdY: 90,
      rightWingSecondY: 90,
    },
  },
  {
    duration: 250,
    to: {
      rotate: 50,
      leftWingThirdY: 95,
      leftWingThirdX: 27,
      rightBodyThirdX: 45,
      rightWingSecondX: 45,
      rightWingThirdX: 60,
      rightWingThirdY: 83,
    },
  },
  {
    duration: 200,
    to: {
      rotate: 55,
      planeX: -8,
      planeY: 24,
    },
  },
];
