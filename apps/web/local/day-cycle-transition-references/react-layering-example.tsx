import type { CSSProperties } from "react";

function MaskLayer(props: {
  maskUrl: string;
  color: string;
  opacity: number;
  blendMode: CSSProperties["mixBlendMode"];
}) {
  return <div className="mask-layer" style={{
    backgroundColor: props.color,
    opacity: props.opacity,
    mixBlendMode: props.blendMode,
    WebkitMaskImage: `url("${props.maskUrl}")`,
    maskImage: `url("${props.maskUrl}")`,
  }} />;
}

export function Scene() {
  return <div className="scene">
    <div className="sky" />
    <img className="base" src="/scene-neutral.png" alt="" />
    <MaskLayer maskUrl="/masks/mask-mountain.png" color="#4B506B" opacity={0.33} blendMode="multiply" />
    <MaskLayer maskUrl="/masks/mask-midground.png" color="#5A5367" opacity={0.24} blendMode="soft-light" />
    <MaskLayer maskUrl="/masks/mask-foreground.png" color="#292C3D" opacity={0.42} blendMode="multiply" />
    <MaskLayer maskUrl="/masks/mask-highlights.png" color="#C4A3AC" opacity={0.12} blendMode="screen" />
    <MaskLayer maskUrl="/masks/mask-shadows.png" color="#172036" opacity={0.20} blendMode="multiply" />
    <div className="celestial" />
    <div className="paper-grain" />
  </div>;
}

/*
.scene { position:relative; width:100%; aspect-ratio:16/9; overflow:hidden; isolation:isolate; }
.scene > * { position:absolute; inset:0; width:100%; height:100%; }
.sky { background:linear-gradient(to bottom,#273B61,#9C6F82); }
.base { object-fit:cover; }
.mask-layer {
  pointer-events:none;
  mask-repeat:no-repeat; mask-position:center; mask-size:100% 100%;
  -webkit-mask-repeat:no-repeat; -webkit-mask-position:center; -webkit-mask-size:100% 100%;
}
*/
