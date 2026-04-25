"use client";
import { useEffect } from "react";

export default function RevealInit() {
  useEffect(() => {
    const observe = () => {
      const els = document.querySelectorAll(".reveal");
      if (!els.length) return;
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
        { threshold: 0.06 }
      );
      els.forEach((el) => io.observe(el));
      return io;
    };

    const io = observe();
    return () => io?.disconnect();
  }, []);

  return null;
}
