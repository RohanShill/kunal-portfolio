"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function ScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check if running on mobile device to optionally tune performance
    const isMobile = window.innerWidth < 768;

    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth luxury deceleration
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: isMobile ? 1.8 : 1.2,
    });

    // Link Lenis scroll event to GSAP ScrollTrigger
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // Bind GSAP ticker loop to Lenis frame updates
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // Multiple delayed refreshes to cover React hydration + image lazy loads
    const refreshScroll = () => {
      ScrollTrigger.refresh();
    };

    if (document.readyState === "complete") {
      refreshScroll();
    } else {
      window.addEventListener("load", refreshScroll);
    }
    const t1 = setTimeout(refreshScroll, 500);
    const t2 = setTimeout(refreshScroll, 1200);
    const t3 = setTimeout(refreshScroll, 2500);

    // Smooth scroll to hash on load after ScrollTrigger finishes hydration
    const handleHashLoad = () => {
      const hash = window.location.hash;
      if (hash) {
        const target = document.querySelector(hash);
        if (target) {
          setTimeout(() => {
            lenis.scrollTo(target as HTMLElement, { offset: 0, duration: 1.0 });
          }, 650);
        }
      }
    };
    
    handleHashLoad();
    window.addEventListener("hashchange", handleHashLoad);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateTicker);
      window.removeEventListener("load", refreshScroll);
      window.removeEventListener("hashchange", handleHashLoad);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return <>{children}</>;
}
