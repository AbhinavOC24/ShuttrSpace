"use client";

import { useEffect, useRef, useState } from "react";
import { useTransform, motion, useScroll, useSpring } from "framer-motion";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const { scrollYProgress } = useScroll();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const smoothProgress = useSpring(scrollYProgress, { mass: 0.1 });

  const y = useTransform(smoothProgress, (value) => {
    if (!viewportHeight) return 0; // safeguard for SSR
    return value * -(contentHeight - viewportHeight);
  });

  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
      setViewportHeight(window.innerHeight);
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [children]);

  return (
    <>
      {/* Spacer div ensures body scroll still works */}
      <div style={{ height: contentHeight }} />

      <motion.div
        ref={contentRef}
        style={{ y }}
        className="w-screen fixed top-0 flex flex-col"
      >
        {children}
      </motion.div>
    </>
  );
}
