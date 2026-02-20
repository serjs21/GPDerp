// app/components/KoiLoader.tsx
// Server Component (no "use client") — pairs with MarkHydrated by reading html[data-hydrated="true"]
import "./animation.css";

export const HtmlLoader = () => {
  
return (
    <div className="scene-container">
  <div className="fuji-scene">
    <div className="sun"></div>
    <div className="mountain">
      <div className="snow-cap"></div>
    </div>
    <div className="cloud c1"></div>
    <div className="cloud c2"></div>
  </div>
</div>
);
}