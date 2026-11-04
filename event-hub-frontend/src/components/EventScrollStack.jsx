import { useCallback, useEffect, useRef } from "react";
import ScrollStack, { ScrollStackItem } from "./animations/ScrollStack";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { cx } from "../lib/cx";

// Unsplash originals are multi-megabyte; ask for a size that covers the
// image column on 2x screens.
const unsplash = (path) =>
  `https://images.unsplash.com/${path}?auto=format&fit=crop&w=960&q=70`;

// Ordered bright → dark, so the stack deepens as it builds. `tone` selects
// the ink set defined on .format-card in index.css.
const FORMATS = [
  {
    title: "Meetups",
    description: "Community-driven gatherings to connect, share ideas, and grow together.",
    image: "https://d3eqn3hw2x95rk.cloudfront.net/gallery_main/2023-04-14.jpg",
    tags: ["Community", "Idea sharing", "Peer learning"],
    tone: "bright",
    gradient: "bg-gradient-to-br from-[#9ee3b5] via-[#5db5a6] to-[#3e797f]",
  },
  {
    title: "Workshops",
    description: "Hands-on sessions designed to sharpen practical skills.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR_MLXSswVTcLlGAAlCiw3CsOSF-A2jSytjA&s",
    tags: ["Hands-on", "Guided labs", "Practical skills"],
    tone: "mid",
    gradient: "bg-gradient-to-br from-[#5db5a6] via-[#3e797f] to-[#255156]",
  },
  {
    title: "Hackathons",
    description: "High-energy coding marathons where ideas turn into real products.",
    image: unsplash("photo-1559028012-481c04fa702d"),
    tags: ["Team builds", "Prototyping", "Demo day"],
    tone: "mid",
    gradient: "bg-gradient-to-br from-[#3e797f] via-[#255156] to-[#10242b]",
  },
  {
    title: "Conferences",
    description: "Large-scale events featuring keynotes, panels, and powerful networking.",
    image: unsplash("photo-1505373877841-8d25f7d46678"),
    tags: ["Keynotes", "Panels", "Networking"],
    tone: "deep",
    gradient: "bg-gradient-to-br from-deep to-night",
  },
];

// Each card in the stack is this much larger than the one behind it.
const ITEM_SCALE = 0.02;

const EventScrollStack = ({ useWindowScroll = true }) => {
  // Phones get a tighter stack so a pinned card (text + 16:10 photo) still
  // fits on screen.
  const compact = useMediaQuery("(max-width: 767px)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <ScrollStack
      useWindowScroll={useWindowScroll}
      itemScale={ITEM_SCALE}
      // Last card settles at scale 1, so its edges line up with the footer.
      baseScale={1 - ITEM_SCALE * (FORMATS.length - 1)}
      blurAmount={0}
      rotationAmount={0}
      // Spacing comes from the grid gap instead: auto-rows-fr makes every
      // card as tall as the tallest, so a shorter card on top can't leave the
      // edges of the ones behind it showing underneath.
      itemDistance={0}
      innerClassName="shell grid auto-rows-fr gap-y-16 md:gap-y-[100px]"
      itemStackDistance={compact ? 16 : 30}
      stackPosition={compact ? "12%" : "20%"}
      scaleEndPosition={compact ? "6%" : "10%"}
    >
      {FORMATS.map((format, index) => (
        <FormatCard
          key={format.title}
          index={index}
          spotlight={!reduceMotion}
          {...format}
        />
      ))}
    </ScrollStack>
  );
};

// Feeds the cursor position to the card's radial spotlight as CSS variables.
// Batched to one write per frame; mouse only, since touch has no hover.
function useSpotlight(enabled) {
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return useCallback(
    (event) => {
      if (!enabled || event.pointerType !== "mouse") return;
      const card = event.currentTarget;
      const { clientX, clientY } = event;

      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        // The stack scales cards down; convert back to the card's own pixels
        // so the glow sits under the cursor rather than drifting from it.
        const scale = rect.width / card.offsetWidth || 1;
        card.style.setProperty("--mouse-x", `${(clientX - rect.left) / scale}px`);
        card.style.setProperty("--mouse-y", `${(clientY - rect.top) / scale}px`);
      });
    },
    [enabled]
  );
}

// Stacked on phones; 6/6 on tablets; 7/5 (text / photo) from 1024px.
const FormatCard = ({ index, title, description, image, tags, tone, gradient, spotlight }) => {
  const onPointerMove = useSpotlight(spotlight);
  const eyebrow = `${String(index + 1).padStart(2, "0")} // Format`;

  return (
    <ScrollStackItem
      itemClassName={cx(
        "format-card flex flex-col justify-center",
        gradient,
        "rounded-[28px] md:rounded-[40px] border border-white/[0.12] shadow-ambient",
        "p-[clamp(1.5rem,4.5vw,4rem)]"
      )}
      data-tone={tone}
      onPointerMove={spotlight ? onPointerMove : undefined}
    >
      <span aria-hidden="true" className="format-card__noise" />
      <span aria-hidden="true" className="format-card__spotlight" />
      <span aria-hidden="true" className="format-card__edge" />

      <div className="relative grid items-center gap-8 md:grid-cols-12 md:gap-x-10">
        <div className="md:col-span-6 lg:col-span-7">
          <p aria-hidden="true" className="format-card__eyebrow">
            {eyebrow}
          </p>
          <h3 className="format-card__title">{title}</h3>
          <p className="format-card__body">{description}</p>

          <ul aria-label={`${title} highlights`} className="mt-7 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag} className="format-card__pill">
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-6 lg:col-span-5">
          <div className="format-card__bezel">
            <div className="format-card__frame">
              {/* Decorative: the heading beside it already names the format */}
              <img
                src={image}
                alt=""
                loading="lazy"
                decoding="async"
                className="format-card__img"
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollStackItem>
  );
};

export default EventScrollStack;
