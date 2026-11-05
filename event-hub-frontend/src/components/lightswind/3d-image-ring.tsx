"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
  easeOut,
} from "motion/react";
import { cx } from "../../lib/cx";

export interface ThreeDImageRingProps {
  images: string[];
  width?: number;
  perspective?: number;
  imageDistance?: number;
  initialRotation?: number;
  animationDuration?: number;
  staggerDelay?: number;
  hoverOpacity?: number;
  containerClassName?: string;
  ringClassName?: string;
  imageClassName?: string;
  backgroundColor?: string;
  draggable?: boolean;
  mobileBreakpoint?: number;
  mobileScaleFactor?: number;
  inertiaPower?: number;
  inertiaTimeConstant?: number;
  inertiaVelocityMultiplier?: number;
}

export default function ThreeDImageRing({
  images,
  width = 300,
  perspective = 2000,
  imageDistance = 500,
  initialRotation = 180,
  animationDuration = 1.5,
  staggerDelay = 0.1,
  hoverOpacity = 0.5,
  containerClassName,
  ringClassName,
  imageClassName,
  backgroundColor,
  draggable = true,
  mobileBreakpoint = 768,
  mobileScaleFactor = 0.8,
  inertiaPower = 0.8,
  inertiaTimeConstant = 300,
  inertiaVelocityMultiplier = 20,
}: ThreeDImageRingProps) {
  const ringRef = useRef<HTMLDivElement>(null);

  const rotationY = useMotionValue(initialRotation);
  const currentRotationY = useRef(initialRotation);
  const startX = useRef(0);
  const isDragging = useRef(false);
  const velocity = useRef(0);

  const [currentScale, setCurrentScale] = useState(1);
  const [mounted, setMounted] = useState(false);

  const angle = useMemo(() => 360 / images.length, [images.length]);

  useEffect(() => {
    const unsub = rotationY.on("change", (v) => {
      currentRotationY.current = v;
    });
    return () => unsub();
  }, [rotationY]);

  useEffect(() => {
    const onResize = () => {
      setCurrentScale(
        window.innerWidth <= mobileBreakpoint ? mobileScaleFactor : 1
      );
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileBreakpoint, mobileScaleFactor]);

  useEffect(() => setMounted(true), []);

  /* ---------------- DRAG + INERTIA ---------------- */
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggable) return;
    isDragging.current = true;
    rotationY.stop();
    startX.current =
      "touches" in e ? e.touches[0].clientX : e.clientX;

    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", onDragEnd);
    document.addEventListener("touchmove", onDrag);
    document.addEventListener("touchend", onDragEnd);
  };

  const onDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;
    const x =
      "touches" in e ? e.touches[0].clientX : e.clientX;
    const delta = x - startX.current;
    velocity.current = -delta * 0.5;
    rotationY.set(currentRotationY.current + velocity.current);
    startX.current = x;
  };

  const onDragEnd = () => {
    isDragging.current = false;

    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", onDragEnd);
    document.removeEventListener("touchmove", onDrag);
    document.removeEventListener("touchend", onDragEnd);

    const start = rotationY.get();
    const boost = velocity.current * inertiaVelocityMultiplier;

    animate(start, start + boost, {
      type: "inertia",
      velocity: boost,
      power: inertiaPower,
      timeConstant: inertiaTimeConstant,
      modifyTarget: (t) => Math.round(t / angle) * angle,
      onUpdate: (v) => rotationY.set(v),
    });

    velocity.current = 0;
  };

  return (
    <div
      className={cx(
        "relative w-full h-full overflow-hidden select-none",
        containerClassName
      )}
      style={{
        backgroundColor,
        transform: `scale(${currentScale})`,
      }}
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
    >
      <div
        style={{
          perspective,
          width,
          height: width * 1.33, // 3/4 poster ratio
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <motion.div
          ref={ringRef}
          className={cx("absolute w-full h-full", ringClassName)}
          style={{
            transformStyle: "preserve-3d",
            rotateY: rotationY,
            cursor: draggable ? "grab" : "default",
          }}
        >
          <AnimatePresence>
            {mounted &&
              images.map((src, index) => (
                <motion.div
                  key={index}
                  className={cx("absolute w-full h-full", imageClassName)}
                  style={{
                    transformStyle: "preserve-3d",
                    rotateY: -index * angle,
                    z: -imageDistance * currentScale,
                    transformOrigin: `50% 50% ${imageDistance * currentScale}px`,
                    backgroundImage: `url(${src})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center center", // 🔑 FIX
                    backfaceVisibility: "hidden",
                    borderRadius: "12px",
                  }}
                  initial={{ y: 200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    delay: index * staggerDelay,
                    duration: animationDuration,
                    ease: easeOut,
                  }}
                  whileHover={{ opacity: 1 }}
                  onHoverStart={() => {
                    if (isDragging.current) return;
                    ringRef.current?.childNodes.forEach((el, i) => {
                      if (i !== index)
                        (el as HTMLElement).style.opacity =
                          hoverOpacity.toString();
                    });
                  }}
                  onHoverEnd={() => {
                    if (isDragging.current) return;
                    ringRef.current?.childNodes.forEach((el) => {
                      (el as HTMLElement).style.opacity = "1";
                    });
                  }}
                />
              ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
