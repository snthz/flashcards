"use client";

import { useEffect } from "react";
import { useLocale } from "@/lib/i18n/client";

export function LandingMotion() {
  const locale = useLocale();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [locale]);

  useEffect(() => {
    const track = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-spotlight]") : null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      target.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    };
    document.addEventListener("pointermove", track, { passive: true });
    return () => document.removeEventListener("pointermove", track);
  }, []);

  return null;
}
