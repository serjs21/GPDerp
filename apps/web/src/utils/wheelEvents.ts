import { Lethargy } from "lethargy-ts";

export const filterInertia = (handler: (event: WheelEvent) => void) => {
  const lethargy = new Lethargy();
  return (event: WheelEvent) => {
    if (!lethargy.check(event)) return;
    handler(event);
  };
};
