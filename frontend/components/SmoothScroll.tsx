"use client";
import { useEffect } from "react";

// Lightweight inertial scroll using native requestAnimationFrame.
// No position:fixed, no broken layouts — just smooth damped scrolling.
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let rafId: number;
    const ease = 0.1; // 0.05 = very slow/buttery, 0.15 = snappy

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetY = Math.max(
        0,
        Math.min(
          document.body.scrollHeight - window.innerHeight,
          targetY + e.deltaY
        )
      );
    };

    const tick = () => {
      currentY = lerp(currentY, targetY, ease);

      // Stop animating when close enough
      if (Math.abs(targetY - currentY) < 0.5) {
        currentY = targetY;
      }

      window.scrollTo(0, currentY);
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return <>{children}</>;
}
