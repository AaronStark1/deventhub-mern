// Vector port of event-hub-frontend/src/components/Footer.jsx at the lg
// layout (brand left, links centred, GitHub right), with `.link-underline`
// and the GitHub button's hover states as per-frame props.
import { mixColor } from "../lib/motion";
import { fonts } from "../theme/fonts";
import { color } from "../theme/tokens";
import { cardMetrics } from "./FormatCard";
import { LogoTile } from "./LogoTile";

const GITHUB =
  "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12";

export const FOOTER_LINKS = ["Home", "Events", "About"] as const;

/** Hover progress for one link: colour + lift run 300ms, the underline 450ms. */
export type LinkHover = { color: number; lift: number; underline: number };

export const Footer = ({
  vw = 1440,
  active = 0,
  links = [],
  github = { color: 0, lift: 0 },
  logoOpacity = 1,
}: {
  vw?: number;
  /** Index of the NavLink matching the current route (Home on "/"). */
  active?: number;
  links?: LinkHover[];
  github?: { color: number; lift: number };
  logoOpacity?: number;
}) => {
  const { shellPad } = cardMetrics(vw);
  return (
    <footer
      style={{
        width: "100%",
        background: color.surface,
        borderTop: "1px solid rgba(22, 56, 64, 0.12)",
        fontFamily: fonts.sans,
      }}
    >
      <div style={{ width: "100%", maxWidth: 1200, marginInline: "auto", paddingInline: shellPad, paddingBlock: 48 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", columnGap: 24, rowGap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <LogoTile size={48} style={{ opacity: logoOpacity }} />
            <p
              style={{
                maxWidth: "30ch",
                textWrap: "balance",
                fontSize: 16,
                lineHeight: 1.375,
                fontWeight: 500,
                color: color.muted,
              }}
            >
              Connecting developers through meaningful events.
            </p>
          </div>

          <nav>
            <ul style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 32, rowGap: 12, fontSize: 15, fontWeight: 600 }}>
              {FOOTER_LINKS.map((label, i) => {
                const h = links[i] ?? { color: 0, lift: 0, underline: 0 };
                const isActive = i === active;
                return (
                  <li key={label}>
                    <span
                      style={{
                        position: "relative",
                        display: "inline-block",
                        lineHeight: "22.5px",
                        color: isActive ? color.deep : mixColor(color.muted, color.deep, h.color),
                        translate: `0 ${-h.lift}px`,
                      }}
                    >
                      {label}
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: -4,
                          height: 1,
                          background: "currentColor",
                          transformOrigin: "left center",
                          scale: `${isActive ? 1 : h.underline} 1`,
                        }}
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            style={{
              justifySelf: "end",
              display: "grid",
              placeItems: "center",
              width: 40,
              height: 40,
              borderRadius: 9999,
              border: `1px solid ${mixColor("rgba(22, 56, 64, 0.15)", "rgba(22, 56, 64, 0.3)", github.color)}`,
              background: mixColor("rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.4)", github.color),
              color: mixColor(color.muted, color.deep, github.color),
              translate: `0 ${-github.lift}px`,
            }}
          >
            <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden>
              <path d={GITHUB} />
            </svg>
          </div>
        </div>

        <div
          style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid rgba(22, 56, 64, 0.12)",
            fontSize: 14,
            lineHeight: "20px",
            color: color.muted,
          }}
        >
          © 2026 DEVentHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

/** `.formats-backdrop`: radial tint plus the faint 56px grid, faded at the edges. */
export const FormatsBackdrop = () => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 70% 640px at 50% 0%, #f2f7f5, transparent 72%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(22, 56, 64, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(22, 56, 64, 0.035) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        backgroundPosition: "center top",
        WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 100%)",
        maskImage: "radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 100%)",
      }}
    />
  </>
);
