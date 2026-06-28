import type { CSSProperties, ImgHTMLAttributes } from "react";

const THEME_SELECTOR_ASSETS = {
  earth: "/theme-selector/earth.png",
  sun: "/theme-selector/sun.png",
  moon: "/theme-selector/moon.png",
} as const;

type ThemeSelectorIconProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  variant: keyof typeof THEME_SELECTOR_ASSETS;
};

export function ThemeSelectorIcon({
  variant,
  className,
  style,
  ...props
}: ThemeSelectorIconProps) {
  const { opacity, ...rest } = style ?? {};
  const imageStyle = {
    ...rest,
    opacity: opacity ?? 1,
  } as CSSProperties;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static theme-selector art from /public
    <img
      src={THEME_SELECTOR_ASSETS[variant]}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
      style={imageStyle}
      onDragStart={(event) => event.preventDefault()}
      {...props}
    />
  );
}
