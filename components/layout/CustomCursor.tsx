"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mx = useRef(0);
  const my = useRef(0);
  const rx = useRef(0);
  const ry = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      cursor.style.left = e.clientX - 4 + "px";
      cursor.style.top = e.clientY - 4 + "px";
    };

    const animate = () => {
      rx.current += (mx.current - rx.current) * 0.12;
      ry.current += (my.current - ry.current) * 0.12;
      ring.style.left = rx.current - 16 + "px";
      ring.style.top = ry.current - 16 + "px";
      rafRef.current = requestAnimationFrame(animate);
    };

    const onEnter = () => {
      cursor.style.transform = "scale(2)";
      ring.style.transform = "scale(1.5)";
      ring.style.borderColor = "rgba(79,142,247,0.7)";
    };
    const onLeave = () => {
      cursor.style.transform = "scale(1)";
      ring.style.transform = "scale(1)";
      ring.style.borderColor = "rgba(79,142,247,0.4)";
    };

    document.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(animate);

    const interactives = document.querySelectorAll("a, button, .faq-item");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  );
}
