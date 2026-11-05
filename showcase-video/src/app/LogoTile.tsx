// Port of `.logo-tile` (index.css): the rounded DEVentHub badge used in the
// footer. `size` scales radius and shadows with it, so a 120px badge is the
// same object as the 48px tile, just closer.
import type { CSSProperties } from "react";
import { Img, staticFile } from "remotion";

export const LogoTile = ({ size = 48, style }: { size?: number; style?: CSSProperties }) => {
  const k = size / 48;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: 10 * k,
        boxShadow: `0 0 0 ${k}px rgba(22, 56, 64, 0.15), 0 ${k}px ${2 * k}px rgba(9, 21, 27, 0.08), 0 ${6 * k}px ${14 * k}px ${-6 * k}px rgba(9, 21, 27, 0.22)`,
        ...style,
      }}
    >
      <Img src={staticFile("logo.svg")} style={{ display: "block", width: size, height: size }} />
      {/* Inner specular line (::after in the app) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          boxShadow: `inset 0 ${k}px 0 rgba(255, 255, 255, 0.22), inset 0 0 0 ${k}px rgba(255, 255, 255, 0.06)`,
        }}
      />
    </div>
  );
};
