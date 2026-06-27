"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import HeroThreeScene from "./components/HeroThreeScene";
import ThreeShaderPlane from "./components/ThreeShaderPlane";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Gallery Items Configuration
const galleryImages = [
  { src: "/01.jpg", category: "portraits", title: "Studio Portrait", sub: "Headshot" },
  { src: "/02.jpg", category: "onset", title: "Dramatic Scene Setup", sub: "On Set" },
  { src: "/03.jpg", category: "editorial", title: "Editorial Fashion", sub: "Suits & Style" },
  { src: "/04.jpg", category: "portraits", title: "Casual Studio Look", sub: "Portrait" },
  { src: "/05.jpg", category: "editorial", title: "Urban Editorial", sub: "Fashion Lookbook" },
  { src: "/06.jpg", category: "onset", title: "Behind The Scenes", sub: "On Set" },
];

export default function Home() {
  // Navigation & Scroll states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Gallery Filter & Lightbox states
  const [activeFilter, setActiveFilter] = useState("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Video Modal state
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Form handling state
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error" | ""; message: string }>({
    type: "",
    message: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Refs for ScrollSpy
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  // YouTube Showreel ID
  const youtubeVideoId = "L33P8x9GqM0";
  const youtubeUrl = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&enablejsapi=1`;

  // Filtered gallery items
  const filteredGallery = galleryImages.filter(
    (item) => activeFilter === "all" || item.category === activeFilter
  );

  // Effect: Scroll events, GSAP ScrollTriggers, Magnetic pull, Stack Pinning
  useEffect(() => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    const handleScroll = () => {
      // Scroll class on nav
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // ScrollSpy Logic
      const scrollPosition = window.scrollY + 120;
      const sectionKeys = Object.keys(sectionsRef.current);
      
      for (const key of sectionKeys) {
        const el = sectionsRef.current[key];
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(key);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Run once initially

    const isMobile = window.innerWidth < 768;

    // 1. Grid staggers are now registered dynamically inside the [activeFilter] hook below to handle category filtering.

    // 2. Timeline track self-drawing
    const timelineLine = document.querySelector(".timeline-line");
    if (timelineLine) {
      gsap.fromTo(timelineLine,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top center",
          scrollTrigger: {
            trigger: ".timeline-container",
            start: "top 60%",
            end: "bottom 75%",
            scrub: 0.8,
          }
        }
      );
    }

    // 3. Pulsing dots reveal
    const dots = document.querySelectorAll(".timeline-dot");
    dots.forEach((dot) => {
      // Pulse looping
      gsap.to(dot, {
        scale: 1.3,
        opacity: 0.4,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Entry trigger
      gsap.fromTo(dot,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          scrollTrigger: {
            trigger: dot,
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          }
        }
      );
    });

    // 4. Alternating Slide Timeline Cards (3D slide + shadow depth)
    const timelineCards = document.querySelectorAll(".timeline-card");
    timelineCards.forEach((card, idx) => {
      const isEven = idx % 2 === 0;
      const isMobile = window.innerWidth < 768;
      
      gsap.fromTo(card,
        {
          opacity: 0,
          x: isMobile ? (isEven ? -20 : 20) : (isEven ? -60 : 60),
          rotateY: isMobile ? (isEven ? 5 : -5) : (isEven ? 12 : -12),
          rotateX: 8,
          scale: 0.95,
          filter: "blur(12px)",
        },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          rotateX: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true,
          }
        }
      );
    });

    // 5. Scroll reveals trigger (general fades, 3D reveals, and clip-path image reveals)
    const reveals = document.querySelectorAll(".reveal-on-scroll, .reveal-3d, .reveal-diagonal, .reveal-slice, .reveal-triangle, .reveal-circle");
    reveals.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        onEnter: () => el.classList.add("revealed"),
        onLeaveBack: () => el.classList.remove("revealed"),
      });
    });

    // 6. Gold Underline trigger
    const underlines = document.querySelectorAll(".gold-underline");
    underlines.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        onEnter: () => el.classList.add("revealed"),
        onLeaveBack: () => el.classList.remove("revealed"),
      });
    });

    // 7. Slow Continuous Card Floating
    const floatingCards = document.querySelectorAll(".floating-card");
    floatingCards.forEach((card) => {
      gsap.to(card, {
        y: "-=8",
        duration: 3.5 + Math.random() * 1.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    });

    // 8. Magnetic Hover Attraction & Cursor 3D Rotation Spring (max 10px / 3deg, desktop hover devices only)
    const hasHover = window.matchMedia("(hover: hover)").matches;
    const magneticElements = document.querySelectorAll(".magnetic-hover");
    
    if (hasHover) {
      magneticElements.forEach((el) => {
        const target = el as HTMLElement;
        
        const onMouseMove = (e: MouseEvent) => {
          const rect = target.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const distanceX = e.clientX - centerX;
          const distanceY = e.clientY - centerY;
          
          // Pull force
          const pullX = (distanceX / rect.width) * 15;
          const pullY = (distanceY / rect.height) * 15;
          const clampedX = Math.max(-10, Math.min(10, pullX));
          const clampedY = Math.max(-10, Math.min(10, pullY));

          // 3D Tilt
          const rotX = -(distanceY / (rect.height / 2)) * 3;
          const rotY = (distanceX / (rect.width / 2)) * 3;
          const clampedRotX = Math.max(-3, Math.min(3, rotX));
          const clampedRotY = Math.max(-3, Math.min(3, rotY));

          gsap.to(target, {
            x: clampedX,
            y: clampedY,
            rotateX: clampedRotX,
            rotateY: clampedRotY,
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        const onMouseLeave = () => {
          gsap.to(target, {
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            duration: 0.7,
            ease: "elastic.out(1, 0.35)",
            overwrite: "auto",
          });
        };

        target.addEventListener("mousemove", onMouseMove, { passive: true });
        target.addEventListener("mouseleave", onMouseLeave, { passive: true });
      });
    }

    // 9. Editorial Portrait Stack Pin Scroll (unified desktop & mobile print frame sliding)
    const stackContainer = document.querySelector(".editorial-stack-container");
    const stackCards = document.querySelectorAll(".editorial-stack-card");
    
    if (stackContainer && stackCards.length > 0) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stackContainer,
          start: "top 15%",
          end: "+=150%",
          scrub: 1.0,
          pin: true,
          anticipatePin: 1,
        }
      });

      stackCards.forEach((card, idx) => {
        if (idx === stackCards.length - 1) return;
        
        tl.to(card, {
          yPercent: -125, // slide fully off screen
          scale: 0.85,
          opacity: 0,
          rotate: -6,
          duration: 1.0,
          ease: "power1.inOut",
        }, idx * 0.9); // smooth continuous exit overlap
      });
    }

    // Perform deferred ScrollTrigger refreshes during page mount to resolve layout height shifts
    const refreshST = () => {
      ScrollTrigger.refresh();
    };
    
    if (document.readyState === "complete") {
      refreshST();
    } else {
      window.addEventListener("load", refreshST);
    }
    const t1 = setTimeout(refreshST, 600);
    const t2 = setTimeout(refreshST, 1500);
    const t3 = setTimeout(refreshST, 3000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("load", refreshST);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Effect: Bind / Re-bind 3D scroll staggers when active category filter changes
  useEffect(() => {
    // Kill existing staggers on card-3d-scroll grid to prevent memory leaks and coordinate mismatch
    ScrollTrigger.getAll().forEach((st) => {
      const triggerEl = st.trigger as HTMLElement | null;
      if (
        triggerEl &&
        triggerEl.classList &&
        (triggerEl.classList.contains("stagger-grid") ||
          (triggerEl.classList.contains("card-3d-scroll") && triggerEl.closest(".stagger-grid")))
      ) {
        st.kill();
      }
    });

    const isMobile = window.innerWidth < 768;
    const grids = document.querySelectorAll(".stagger-grid");
    
    // Set a short delay to allow React to update the DOM elements in grid list
    const timer = setTimeout(() => {
      grids.forEach((grid) => {
        const cards = grid.querySelectorAll(".card-3d-scroll");
        if (cards.length === 0) return;

        // Reset any leftover inline styles from prior filters to clear state
        gsap.set(cards, { clearProps: "all" });

        gsap.fromTo(cards,
          {
            transformPerspective: 2500,
            y: isMobile ? 50 : 120,
            rotateX: isMobile ? 8 : 18,
            rotateY: isMobile ? -4 : -10,
            scale: isMobile ? 0.95 : 0.9,
            opacity: 0,
            filter: `blur(${isMobile ? 8 : 20}px)`,
          },
          {
            y: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            stagger: isMobile ? 0.08 : 0.15,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: grid,
              start: "top 88%",
              once: true,
            }
          }
        );
      });
      ScrollTrigger.refresh();
    }, 120);

    return () => {
      clearTimeout(timer);
    };
  }, [activeFilter]);

  // Effect: Keyboard controls for Lightbox and Video Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === "Escape") setLightboxOpen(false);
        if (e.key === "ArrowRight") handleNextImage();
        if (e.key === "ArrowLeft") handlePrevImage();
      }
      if (videoModalOpen && e.key === "Escape") {
        setVideoModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, lightboxIndex, videoModalOpen, filteredGallery]);

  // Gallery Navigation Functions
  const handlePrevImage = () => {
    setLightboxIndex((prev) => (prev === 0 ? filteredGallery.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setLightboxIndex((prev) => (prev === filteredGallery.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = (imageSrc: string) => {
    const index = filteredGallery.findIndex((img) => img.src === imageSrc);
    if (index !== -1) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  // Form Submission
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormStatus({ type: "", message: "" });

    const form = e.currentTarget;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      });
      const res = await response.json();
      if (response.status === 200) {
        setFormStatus({
          type: "success",
          message: "Thank you! Your booking request has been sent successfully.",
        });
        form.reset();
      } else {
        setFormStatus({
          type: "error",
          message: res.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      setFormStatus({
        type: "error",
        message: "Form submission failed due to a connection error. Please try direct email.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Helper: Section Ref setter
  const setSectionRef = (key: string) => (el: HTMLElement | null) => {
    sectionsRef.current[key] = el;
  };

  // JSON-LD Person schema markup
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Kunal Shill",
    "jobTitle": "Actor & Model",
    "description": "Indian television actor and model in the Bengali entertainment industry, best known for his role as Swastik Mukherjee in Geeta L.L.B. and the lead in Ghurni.",
    "image": "https://kunalshill.com/01.jpg",
    "url": "https://kunalshill.com",
    "sameAs": [
      "https://www.instagram.com/_kunal_shill",
      "https://www.facebook.com/KunalShillOfficial"
    ],
    "knowsAbout": ["Acting", "Modeling", "Bengali Television", "Performing Arts"],
    "award": "Star Jalsha Parivaar Award 2025"
  };

  return (
    <div className="relative w-full overflow-x-hidden flex flex-col min-h-screen">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* Navigation Header */}
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          scrolled
            ? "py-3 bg-obsidian/85 backdrop-blur-md border-b border-white/5 shadow-lg"
            : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <a
            href="#home"
            className="font-serif text-xl md:text-2xl font-bold tracking-[0.18em] text-white relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-2/5 after:height-[2px] after:bg-gold"
          >
            KUNAL SHILL
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {["home", "about", "showreel", "filmography", "gallery", "press-awards"].map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className={`text-xs font-medium uppercase tracking-[0.12em] transition-colors relative py-1 hover:text-white ${
                  activeSection === item ? "text-white after:w-full" : "text-[#a1a1a6] after:w-0"
                } after:content-[''] after:absolute after:bottom-0 after:left-0 after:height-[1px] after:bg-gold after:transition-all after:duration-300`}
              >
                {item.replace("-", " & ")}
              </a>
            ))}
            <a
              href="#contact"
              className="text-xs font-semibold uppercase tracking-[0.1em] border border-gold/30 bg-gold/10 px-5 py-2.5 rounded-sm text-gold hover:bg-gold hover:text-obsidian hover:border-gold transition-all duration-300"
            >
              Book Kunal
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex flex-col justify-center gap-1.5 w-6 h-6 bg-transparent border-none cursor-pointer z-50"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-full h-[2px] bg-white transition-all duration-300 ${
                mobileMenuOpen ? "transform translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block w-full h-[2px] bg-white transition-all duration-300 ${
                mobileMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-full h-[2px] bg-white transition-all duration-300 ${
                mobileMenuOpen ? "transform -translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile menu drawer */}
        <div
          className={`lg:hidden fixed top-0 right-0 w-[300px] h-screen bg-obsidian/98 backdrop-blur-xl border-l border-white/5 shadow-2xl z-40 flex flex-col justify-center gap-8 p-12 transition-transform duration-500 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {["home", "about", "showreel", "filmography", "gallery", "press-awards"].map((item) => (
            <a
              key={item}
              href={`#${item}`}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium uppercase tracking-widest ${
                activeSection === item ? "text-gold" : "text-[#a1a1a6]"
              } hover:text-white transition-colors`}
            >
              {item.replace("-", " & ")}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold uppercase tracking-widest text-center border border-gold/30 bg-gold/10 px-5 py-3 rounded-sm text-gold hover:bg-gold hover:text-obsidian hover:border-gold transition-all"
          >
            Book Kunal
          </a>
        </div>

        {/* Mobile menu backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300"
          />
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        
        {/* Hero Section */}
        <section
          ref={setSectionRef("home")}
          id="home"
          className="relative w-full h-screen flex items-center justify-center overflow-hidden"
        >
          {/* Volumetric Three.js background scene */}
          <HeroThreeScene />

          <div className="absolute top-0 left-0 w-full h-full z-0 mix-blend-lighten pointer-events-none opacity-90">
            <Image
              src="/01.jpg"
              alt="Kunal Shill Hero Portrait"
              fill
              priority
              className="object-cover object-[center_20%] brightness-75 animate-zoomBg [mask-image:radial-gradient(circle_at_center,black_30%,transparent_80%)]"
            />
          </div>

          <div className="relative z-10 text-center max-w-4xl px-6 md:px-12 mt-14">
            <span className="text-xs md:text-sm font-bold uppercase tracking-[0.35em] text-gold block mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              Actor & Model
            </span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] text-white">
              Kunal Shill
            </h1>
            <p className="font-serif italic text-lg md:text-2xl text-white/90 mb-12 drop-shadow-[0_2px_15px_rgba(0,0,0,0.7)]">
              Bringing Stories to Life on Screen and Stage
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setVideoModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gold border border-gold hover:bg-transparent hover:text-gold hover:shadow-gold-glow px-8 py-3.5 rounded-sm text-sm font-bold tracking-widest uppercase text-obsidian transform transition-all duration-300 magnetic-hover"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Showreel
              </button>
              <a
                href="#filmography"
                className="w-full sm:w-auto text-center border border-white/20 hover:border-white hover:bg-white/5 px-8 py-3.5 rounded-sm text-sm font-bold tracking-widest uppercase text-white transform transition-all duration-300 magnetic-hover"
              >
                View Filmography
              </a>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 hidden sm:block">
            <a href="#about" aria-label="Scroll Down" className="group">
              <span className="w-7 h-12 border-2 border-white/40 group-hover:border-gold rounded-full block relative transition-all duration-300">
                <span className="w-1 h-2 bg-gold rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 animate-scrollMouse" />
              </span>
            </a>
          </div>
        </section>

        {/* About Section */}
        <section
          ref={setSectionRef("about")}
          id="about"
          className="relative bg-charcoal section-padding overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-radial-[circle,rgba(212,175,55,0.03)_0%,transparent_70%] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-12 reveal-3d-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              
              {/* Photo Frame */}
              <div className="lg:col-span-5 flex justify-center reveal-3d">
                <div className="relative w-full max-w-[400px] aspect-[4/5] shadow-2xl group">
                  <div className="absolute inset-0 border border-gold/20 z-10 pointer-events-none" />
                  <div className="absolute top-[15px] left-[15px] right-[-15px] bottom-[-15px] border-2 border-gold -z-10 group-hover:top-[5px] group-hover:left-[5px] group-hover:right-[-5px] group-hover:bottom-[-5px] transition-all duration-300" />
                  <ThreeShaderPlane
                    src="/02.jpg"
                    alt="Kunal Shill Portrait"
                    aspectRatio="aspect-[4/5]"
                    className="grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </div>

              {/* Bio Details */}
              <div className="lg:col-span-7 reveal-3d">
                <div className="section-header mb-8">
                  <span className="section-subtitle block text-gold text-xs font-bold uppercase tracking-[0.25em] mb-2 gold-underline">
                    Biography
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 relative after:content-[''] after:block after:w-12 after:h-[2px] after:bg-gold after:mt-4 heading-reveal">
                    The Journey
                  </h2>
                </div>

                <p className="text-[#a1a1a6] text-base leading-relaxed mb-6">
                  Kunal Shill is a dynamic 25-year-old Indian actor and model making waves in the Bengali television and entertainment industry. Blessed with an expressive screen presence and natural versatility, Kunal shot to mainstream prominence with his debut lead role as the intense and righteous defense lawyer <strong className="text-white">Swastik Mukherjee</strong> in Star Jalsha&apos;s widely popular courtroom drama <em className="italic">Geeta L.L.B.</em> (2023–2025).
                </p>
                <p className="text-[#a1a1a6] text-base leading-relaxed mb-8">
                  His breakthrough performance established him as a household name across Bengal. Transitioning seamlessly from television drama to editorial modeling and music videos, Kunal is set to headline Star Jalsha&apos;s highly anticipated sports serial <em className="italic">Ghurni</em> (2026), portraying the passionate captain of a men&apos;s cricket team.
                </p>

                {/* Actor stats */}
                <div className="grid grid-cols-2 gap-6 py-6 border-t border-b border-white/10 mb-8">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6e6e73] tracking-[0.15em] block mb-1">Height</span>
                    <span className="font-serif text-lg text-white">5&apos;11&quot; (180 cm)</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6e6e73] tracking-[0.15em] block mb-1">Hair</span>
                    <span className="font-serif text-lg text-white">Black / Wavy</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6e6e73] tracking-[0.15em] block mb-1">Eyes</span>
                    <span className="font-serif text-lg text-white">Dark Brown</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6e6e73] tracking-[0.15em] block mb-1">Languages</span>
                    <span className="font-serif text-lg text-white">Bengali, Hindi, English</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <a
                    href="#contact"
                    className="inline-flex justify-center bg-gold border border-gold hover:bg-transparent hover:text-gold px-6 py-3 rounded-sm text-xs font-bold tracking-widest uppercase text-obsidian transition-all duration-300 magnetic-hover"
                  >
                    Book Kunal
                  </a>
                  <a
                    href="https://www.instagram.com/_kunal_shill"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-[#e1306c] hover:bg-[#e1306c] px-6 py-3 rounded-sm text-xs font-bold tracking-widest uppercase text-white hover:shadow-[0_4px_15px_rgba(225,48,108,0.3)] transition-all duration-300 magnetic-hover"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                    </svg>
                    Instagram
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Showreel Section */}
        <section
          ref={setSectionRef("showreel")}
          id="showreel"
          className="bg-obsidian section-padding"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center reveal-3d-container">
            <div className="section-header max-w-2xl mx-auto mb-16">
              <span className="section-subtitle block text-gold text-xs font-bold uppercase tracking-[0.25em] mb-2 gold-underline">
                Featured Reels
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 relative after:content-[''] after:block after:w-12 after:h-[2px] after:bg-gold after:mx-auto after:mt-4 heading-reveal">
                Showreel
              </h2>
              <p className="text-[#a1a1a6] text-base">
                A curated selection of dramatic sequences, brand advertisements, and performance highlights showcasing Kunal&apos;s range.
              </p>
            </div>

            {/* Video Card */}
            <div className="max-w-[960px] mx-auto rounded-md overflow-hidden shadow-2xl relative aspect-[16/9] group reveal-3d card-3d-scroll magnetic-hover glass-sweep">
              <Image
                src="/03.jpg"
                alt="Showreel Thumbnail"
                fill
                sizes="(max-width: 1024px) 100vw, 960px"
                className="object-cover group-hover:scale-[1.04] transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent group-hover:from-black/92 group-hover:via-black/30 transition-all duration-300 pointer-events-none" />
              
              <button
                onClick={() => setVideoModalOpen(true)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer z-10"
                aria-label="Play Showreel"
              >
                <span className="w-[85px] h-[85px] rounded-full bg-gold/95 text-obsidian flex items-center justify-center text-2xl transition-all duration-300 shadow-[0_0_35px_rgba(212,175,55,0.4)] pl-1 hover:scale-[1.15] hover:bg-white hover:shadow-[0_0_45px_rgba(255,255,255,0.6)]">
                  <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </button>

              <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-left z-10 pointer-events-none">
                <h3 className="font-serif text-lg md:text-2xl font-bold text-white mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                  Kunal Shill — Drama & Commercial Reel
                </h3>
                <p className="text-[#a1a1a6] text-xs md:text-sm">
                  Featuring highlights from Geeta L.L.B., Brand Advertisements & Music Videos
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filmography Section */}
        <section
          ref={setSectionRef("filmography")}
          id="filmography"
          className="bg-charcoal section-padding relative"
        >
          <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-radial-[circle,rgba(229,9,20,0.02)_0%,transparent_70%] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-12 reveal-on-scroll">
            <div className="section-header mb-16">
              <span className="section-subtitle block text-gold text-xs font-bold uppercase tracking-[0.25em] mb-2 gold-underline">
                Selected Work
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 relative after:content-[''] after:block after:w-12 after:h-[2px] after:bg-gold after:mt-4 heading-reveal">
                Filmography
              </h2>
            </div>

            {/* Timeline */}
            <div className="relative max-w-4xl mx-auto py-8 timeline-container">
              <div className="absolute top-0 bottom-0 left-[31px] w-[2px] bg-white/8 timeline-line" />
              
              {/* Ghurni */}
              <div className="relative pl-20 mb-16 group reveal-3d">
                <div className="absolute left-[20px] top-[4px] w-6 h-6 rounded-full bg-charcoal border-2 border-white/20 z-10 timeline-dot transition-all duration-300" />
                
                <div className="bg-card p-6 md:p-8 rounded-md border border-white/3 shadow-md hover:-translate-y-1 hover:border-gold/15 hover:shadow-gold-glow transition-all duration-300 relative flex flex-col md:block card-3d-scroll timeline-card floating-card">
                  <span className="font-sans font-bold text-gold text-sm block mb-2 order-1 md:order-none">2026</span>
                  <span className="relative md:absolute md:top-8 md:right-8 text-[10px] uppercase font-bold tracking-widest bg-gold/10 border border-gold/20 text-gold px-3.5 py-1.5 rounded-sm self-start mb-4 md:mb-0 order-2 md:order-none">
                    Upcoming
                  </span>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-1 order-3 md:order-none">Ghurni</h3>
                  <span className="text-sm font-semibold text-white block mb-1">Lead Role (Cricket Team Captain)</span>
                  <span className="text-xs text-[#6e6e73] flex items-center gap-1.5 mb-5">
                    <svg className="w-3.5 h-3.5 fill-gold" viewBox="0 0 24 24">
                      <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
                    </svg>
                    Star Jalsha Serial
                  </span>
                  <p className="text-[#a1a1a6] text-sm">
                    A highly anticipated sports-themed TV drama. Kunal stars as the passionate captain of a men&apos;s cricket team navigating love, duty, and professional sports.
                  </p>
                </div>
              </div>

              {/* Geeta L.L.B */}
              <div className="relative pl-20 mb-16 group reveal-3d">
                <div className="absolute left-[20px] top-[4px] w-6 h-6 rounded-full bg-charcoal border-2 border-white/20 z-10 timeline-dot transition-all duration-300" />
                
                <div className="bg-card p-6 md:p-8 rounded-md border border-white/3 shadow-md hover:-translate-y-1 hover:border-gold/15 hover:shadow-gold-glow transition-all duration-300 relative flex flex-col md:block card-3d-scroll timeline-card">
                  <span className="font-sans font-bold text-gold text-sm block mb-2 order-1 md:order-none">2023 - 2025</span>
                  <span className="relative md:absolute md:top-8 md:right-8 text-[10px] uppercase font-bold tracking-widest bg-crimson/10 border border-crimson/20 text-[#ff333f] px-3.5 py-1.5 rounded-sm self-start mb-4 md:mb-0 order-2 md:order-none">
                    Breakthrough Debut
                  </span>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-1 order-3 md:order-none">Geeta L.L.B.</h3>
                  <span className="text-sm font-semibold text-white block mb-1">Swastik Mukherjee (Male Lead)</span>
                  <span className="text-xs text-[#6e6e73] flex items-center gap-1.5 mb-5">
                    <svg className="w-3.5 h-3.5 fill-gold" viewBox="0 0 24 24">
                      <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
                    </svg>
                    Star Jalsha TV Series
                  </span>
                  <p className="text-[#a1a1a6] text-sm">
                    Kunal&apos;s breakthrough role as Swastik, a defense attorney in Star Jalsha&apos;s flagship courtroom drama. The serial was a massive success, running for nearly two years and garnering critical and commercial praise.
                  </p>
                </div>
              </div>

              {/* Bolbo Tomake */}
              <div className="relative pl-20 mb-16 group reveal-3d">
                <div className="absolute left-[20px] top-[4px] w-6 h-6 rounded-full bg-charcoal border-2 border-white/20 z-10 timeline-dot transition-all duration-300" />
                
                <div className="bg-card p-8 rounded-md border border-white/3 shadow-md card-3d-scroll timeline-card floating-card">
                  <span className="font-sans font-bold text-gold text-sm block mb-2">2024</span>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-1">Bolbo Tomake</h3>
                  <span className="text-sm font-semibold text-white block mb-1">Male Protagonist</span>
                  <span className="text-xs text-[#6e6e73] flex items-center gap-1.5 mb-5">
                    <svg className="w-3.5 h-3.5 fill-gold" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                    Zee Music Bangla Music Video
                  </span>
                  <p className="text-[#a1a1a6] text-sm">
                    Romance music video alongside co-star Ashmita Chakraborty. Sung by Barenya Saha. Visual production featuring beautiful aesthetics and deep emotional range.
                  </p>
                </div>
              </div>

              {/* Commercials */}
              <div className="relative pl-20 group reveal-3d">
                <div className="absolute left-[20px] top-[4px] w-6 h-6 rounded-full bg-charcoal border-2 border-white/20 z-10 timeline-dot transition-all duration-300" />
                
                <div className="bg-card p-8 rounded-md border border-white/3 shadow-md card-3d-scroll timeline-card">
                  <span className="font-sans font-bold text-gold text-sm block mb-2">Ongoing</span>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-1">Brand Campaigns</h3>
                  <span className="text-sm font-semibold text-white block mb-1">Lead Model</span>
                  <span className="text-xs text-[#6e6e73] flex items-center gap-1.5 mb-5">
                    <svg className="w-3.5 h-3.5 fill-gold" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                    </svg>
                    Commercial Campaigns
                  </span>
                  <p className="text-[#a1a1a6] text-sm">
                    Featured in multiple high-profile brand advertisements, fashion lookbooks, and digital campaigns across India.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section
          ref={setSectionRef("gallery")}
          id="gallery"
          className="bg-obsidian section-padding"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="section-header mb-12">
              <span className="section-subtitle block text-gold text-xs font-bold uppercase tracking-[0.25em] mb-2 gold-underline">
                Visuals
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 relative after:content-[''] after:block after:w-12 after:h-[2px] after:bg-gold after:mt-4 heading-reveal">
                Gallery
              </h2>
            </div>

            {/* Editorial Stack Scroll Showcase */}
            <div className="editorial-stack-container relative w-full max-w-[300px] md:max-w-[400px] mx-auto h-[400px] md:h-[550px] mb-32 block pointer-events-none">
              <div className="absolute text-center -top-20 left-0 right-0">
                <span className="text-gold text-xs font-bold uppercase tracking-[0.25em] block mb-2 gold-underline">Featured Stack</span>
                <h3 className="font-serif text-2xl font-bold text-white">Editorial Showcase</h3>
                <p className="text-[#a1a1a6] text-xs mt-1">Scroll down to slide print portrait frames</p>
              </div>
              
              <div className="relative w-full h-full block">
                <div className="editorial-stack-card absolute inset-0 w-full h-full rounded-md overflow-hidden shadow-2xl border border-white/10 bg-charcoal z-30">
                  <Image src="/01.jpg" alt="Editorial Card 1" fill className="object-cover" onLoad={() => ScrollTrigger.refresh()} />
                </div>
                <div className="editorial-stack-card absolute inset-0 w-full h-full rounded-md overflow-hidden shadow-2xl border border-white/10 bg-charcoal z-20">
                  <Image src="/02.jpg" alt="Editorial Card 2" fill className="object-cover" onLoad={() => ScrollTrigger.refresh()} />
                </div>
                <div className="editorial-stack-card absolute inset-0 w-full h-full rounded-md overflow-hidden shadow-2xl border border-white/10 bg-charcoal z-10">
                  <Image src="/03.jpg" alt="Editorial Card 3" fill className="object-cover" onLoad={() => ScrollTrigger.refresh()} />
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 reveal-3d-container">
            {/* Filter buttons */}
            <div className="flex justify-center flex-wrap gap-3 mb-12">
              {["all", "portraits", "editorial", "onset"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded-full border transition-all duration-300 ${
                    activeFilter === filter
                      ? "bg-gold text-obsidian border-gold shadow-[0_4px_15px_rgba(212,175,55,0.25)]"
                      : "bg-transparent text-[#a1a1a6] border-white/8 hover:text-white"
                  }`}
                >
                  {filter === "onset" ? "On Set" : filter}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-grid">
              {filteredGallery.map((item, index) => (
                <div
                  key={item.src}
                  onClick={() => openLightbox(item.src)}
                  className={`relative aspect-[4/5] rounded-sm overflow-hidden shadow-md bg-card cursor-zoom group reveal-3d card-3d-scroll magnetic-hover glass-sweep ${
                    index === 0 ? "reveal-diagonal" :
                    index === 1 ? "reveal-slice" :
                    index === 2 ? "reveal-triangle" :
                    index === 3 ? "reveal-circle" :
                    index === 4 ? "reveal-diagonal" : "reveal-slice"
                  }`}
                >
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-all duration-500"
                    onLoad={() => ScrollTrigger.refresh()}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/92 via-obsidian/40 to-obsidian/15 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-8">
                    <h4 className="font-serif text-xl font-bold text-white mb-1 translate-y-[15px] group-hover:translate-y-0 transition-all duration-300">
                      {item.title}
                    </h4>
                    <span className="text-xs font-semibold text-gold uppercase tracking-wider translate-y-[15px] group-hover:translate-y-0 transition-all duration-300 delay-75">
                      {item.sub}
                    </span>
                    <span className="absolute top-8 right-8 text-white opacity-0 scale-75 group-hover:opacity-80 group-hover:scale-100 transition-all duration-300">
                      <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Press & Awards Section */}
        <section
          ref={setSectionRef("press-awards")}
          id="press-awards"
          className="bg-charcoal section-padding border-t border-white/3"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 reveal-3d-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 stagger-grid">
              
              {/* Press Column */}
              <div className="reveal-3d">
                <div className="section-header mb-12">
                  <span className="section-subtitle block text-gold text-xs font-bold uppercase tracking-[0.25em] mb-2 gold-underline">
                    In the News
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 relative after:content-[''] after:block after:w-12 after:h-[2px] after:bg-gold after:mt-4 heading-reveal">
                    Press Mentions
                  </h2>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="bg-card border border-white/2 p-8 rounded-md shadow-lg relative before:content-['“'] before:font-serif before:text-8xl before:text-gold/8 before:absolute before:top-[-10px] before:left-4 card-3d-scroll">
                    <p className="font-serif italic text-lg leading-relaxed text-white/90 mb-4 relative z-10">
                      &quot;Kunal Shill, who rose to fame as Swastik in the courtroom drama Geeta L.L.B., is set to return to television. Fans are eagerly anticipating his comeback as a lead role in the upcoming Star Jalsha drama &apos;Ghurni&apos; in 2026.&quot;
                    </p>
                    <span className="text-xs font-bold text-gold uppercase tracking-wider block">
                      — Aajkaal News (Bengali Entertainment)
                    </span>
                  </div>

                  <div className="bg-card border border-white/2 p-8 rounded-md shadow-lg relative before:content-['“'] before:font-serif before:text-8xl before:text-gold/8 before:absolute before:top-[-10px] before:left-4 card-3d-scroll">
                    <p className="font-serif italic text-lg leading-relaxed text-white/90 mb-4 relative z-10">
                      &quot;His portrayal of Swastik Mukherjee resonated deeply with families, making him one of the most successful TV debuts on Star Jalsha in recent years.&quot;
                    </p>
                    <span className="text-xs font-bold text-gold uppercase tracking-wider block">
                      — Star Jalsha Television Review
                    </span>
                  </div>
                </div>
              </div>

              {/* Awards Column */}
              <div className="reveal-3d">
                <div className="section-header mb-12">
                  <span className="section-subtitle block text-gold text-xs font-bold uppercase tracking-[0.25em] mb-2 gold-underline">
                    Accolades
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 relative after:content-[''] after:block after:w-12 after:h-[2px] after:bg-gold after:mt-4 heading-reveal">
                    Awards
                  </h2>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="flex gap-6 bg-card border border-white/2 p-8 rounded-md shadow-lg card-3d-scroll">
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gold/8 border border-gold/20 text-gold flex items-center justify-center text-xl">
                      <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a3 3 0 10-3 3h3zm0-3c1.657 0 3 .895 3 2H9c0-1.105 1.343-2 3-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11h.01M12 14h.01M12 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs text-[#6e6e73] font-bold uppercase tracking-wider block mb-1">2025</span>
                      <h3 className="font-serif text-xl font-bold text-white mb-1">Star Jalsha Parivaar Award</h3>
                      <p className="text-white text-sm font-semibold mb-1">Winner — Best Debuting Male Lead</p>
                      <span className="text-xs text-[#a1a1a6] italic block">For Geeta L.L.B.</span>
                    </div>
                  </div>

                  <div className="flex gap-6 bg-card border border-white/2 p-8 rounded-md shadow-lg card-3d-scroll">
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gold/8 border border-gold/20 text-gold flex items-center justify-center text-xl">
                      <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs text-[#6e6e73] font-bold uppercase tracking-wider block mb-1">2024</span>
                      <h3 className="font-serif text-xl font-bold text-white mb-1">Television Excellence Nominations</h3>
                      <p className="text-white text-sm font-semibold mb-1">Nominated — Favorite Actor (Drama)</p>
                      <span className="text-xs text-[#a1a1a6] italic block">For Geeta L.L.B.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          ref={setSectionRef("contact")}
          id="contact"
          className="bg-obsidian section-padding"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 reveal-3d-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 stagger-grid">
              
              {/* Info Panel */}
              <div className="flex flex-col reveal-3d">
                <div className="section-header mb-8">
                  <span className="section-subtitle block text-gold text-xs font-bold uppercase tracking-[0.25em] mb-2 gold-underline">
                    Representation
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 relative after:content-[''] after:block after:w-12 after:h-[2px] after:bg-gold after:mt-4 heading-reveal">
                    Get In Touch
                  </h2>
                  <p className="text-[#a1a1a6] text-base">
                    For film, television, web series, model assignments, brand collaborations, and press inquiries, please reach out via the booking form or direct contact.
                  </p>
                </div>

                <div className="flex flex-col gap-6 my-10">
                  <div className="flex items-center gap-5 group">
                    <div className="w-12 h-12 rounded-sm bg-white/3 border border-white/5 text-gold flex items-center justify-center text-lg group-hover:bg-gold group-hover:text-obsidian group-hover:border-gold group-hover:shadow-[0_4px_15px_rgba(212,175,55,0.3)] transition-all duration-300">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6e6e73] tracking-[0.12em] block mb-0.5">Direct Inquiries</span>
                      <a href="mailto:bookings@kunalshill.com" className="text-white hover:text-gold font-semibold text-lg transition-colors">
                        bookings@kunalshill.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-sm bg-white/3 border border-white/5 text-gold flex items-center justify-center text-lg">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6e6e73] tracking-[0.12em] block mb-0.5">Location</span>
                      <p className="text-white font-semibold text-lg">Kolkata, West Bengal, India</p>
                    </div>
                  </div>
                </div>

                <div className="social-links-panel">
                  <h4 className="text-[#a1a1a6] text-xs font-bold uppercase tracking-[0.15em] mb-4">
                    Follow Official Channels
                  </h4>
                  <div className="flex gap-3">
                    <a
                      href="https://www.instagram.com/_kunal_shill"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="w-11 h-11 rounded-sm bg-white/3 border border-white/5 text-white flex items-center justify-center text-lg hover:bg-[#e1306c] hover:border-[#e1306c] hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(225,48,108,0.3)] transition-all duration-300 magnetic-hover"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.facebook.com/KunalShillOfficial"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="w-11 h-11 rounded-sm bg-white/3 border border-white/5 text-white flex items-center justify-center text-lg hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all duration-300 magnetic-hover"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Form Panel */}
              <div className="bg-card p-8 md:p-12 rounded-lg border border-white/3 shadow-2xl reveal-3d card-3d-scroll">
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
                  {/* Access key Web3forms */}
                  <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE" />
                  <input type="hidden" name="subject" value="New Portfolio Booking Inquiry - Kunal Shill" />
                  <input type="checkbox" name="botcheck" className="hidden" />

                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-xs uppercase font-bold text-[#a1a1a6] tracking-wider">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="e.g. John Doe"
                      className="bg-obsidian/60 border border-white/8 p-3.5 rounded-sm text-white placeholder-white/20 focus:outline-none focus:border-gold focus:shadow-[0_0_10px_rgba(212,175,55,0.15)] focus:bg-obsidian transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-xs uppercase font-bold text-[#a1a1a6] tracking-wider">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        placeholder="john@example.com"
                        className="bg-obsidian/60 border border-white/8 p-3.5 rounded-sm text-white placeholder-white/20 focus:outline-none focus:border-gold focus:shadow-[0_0_10px_rgba(212,175,55,0.15)] focus:bg-obsidian transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="phone" className="text-xs uppercase font-bold text-[#a1a1a6] tracking-wider">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="+91 98765 43210"
                        className="bg-obsidian/60 border border-white/8 p-3.5 rounded-sm text-white placeholder-white/20 focus:outline-none focus:border-gold focus:shadow-[0_0_10px_rgba(212,175,55,0.15)] focus:bg-obsidian transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="inquiry-type" className="text-xs uppercase font-bold text-[#a1a1a6] tracking-wider">Inquiry Type</label>
                    <select
                      id="inquiry-type"
                      name="inquiry_type"
                      className="bg-obsidian/60 border border-white/8 p-3.5 rounded-sm text-white focus:outline-none focus:border-gold focus:shadow-[0_0_10px_rgba(212,175,55,0.15)] focus:bg-obsidian cursor-pointer transition-all"
                    >
                      <option value="television">Television / Web Project</option>
                      <option value="feature-film">Feature Film</option>
                      <option value="modeling">Modeling / Editorial</option>
                      <option value="brand-collaboration">Brand Collaboration</option>
                      <option value="appearance">Appearance / Press Event</option>
                      <option value="other">Other / Personal Message</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-xs uppercase font-bold text-[#a1a1a6] tracking-wider">Project Details / Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      placeholder="Detail the shoot dates, production house, role, or campaign details..."
                      className="bg-obsidian/60 border border-white/8 p-3.5 rounded-sm text-white placeholder-white/20 focus:outline-none focus:border-gold focus:shadow-[0_0_10px_rgba(212,175,55,0.15)] focus:bg-obsidian transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full flex items-center justify-center bg-gold border border-gold hover:bg-transparent hover:text-gold px-8 py-3.5 rounded-sm text-sm font-bold tracking-widest uppercase text-obsidian disabled:opacity-50 transition-all duration-300 magnetic-hover"
                  >
                    {formSubmitting ? "Sending Message..." : "Send Message"}
                  </button>

                  {formStatus.type && (
                    <div
                      className={`text-sm font-semibold mt-2 ${
                        formStatus.type === "success" ? "text-emerald-400" : "text-crimson"
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}
                </form>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#070708] border-t border-white/3 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <p className="font-serif text-2xl font-bold tracking-[0.2em] text-white mb-6">
            KUNAL SHILL
          </p>
          <p className="text-[#6e6e73] text-xs mb-8 leading-relaxed">
            &copy; 2026 Kunal Shill. All Rights Reserved. Designed for Theatrical & Cinematic Screen Presence.
          </p>
          <div className="flex justify-center gap-6">
            <a
              href="https://www.instagram.com/_kunal_shill"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full bg-white/2 border border-white/4 text-[#a1a1a6] flex items-center justify-center hover:bg-gold hover:text-obsidian hover:border-gold hover:-translate-y-1 transition-all duration-300"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/KunalShillOfficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 rounded-full bg-white/2 border border-white/4 text-[#a1a1a6] flex items-center justify-center hover:bg-gold hover:text-obsidian hover:border-gold hover:-translate-y-1 transition-all duration-300"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Cinematic Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-all">
          <div
            onClick={() => setVideoModalOpen(false)}
            className="absolute inset-0 bg-[#070708]/95 backdrop-blur-md cursor-pointer"
          />
          
          <div className="relative z-10 w-[90%] max-w-[900px] aspect-[16/9] bg-black rounded-sm border border-white/5 overflow-hidden shadow-2xl animate-[fadeInUp_0.5s_cubic-bezier(0.25,0.8,0.25,1)]">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/3 border border-white/8 text-white flex items-center justify-center cursor-pointer hover:bg-white hover:text-obsidian hover:border-white transition-all"
              aria-label="Close Showreel"
            >
              <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full h-full relative">
              <iframe
                src={youtubeUrl}
                title="Kunal Shill Showreel"
                className="absolute inset-0 w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Photo Gallery Lightbox */}
      {lightboxOpen && filteredGallery[lightboxIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-all">
          <div
            onClick={() => setLightboxOpen(false)}
            className="absolute inset-0 bg-[#070708]/95 backdrop-blur-md cursor-pointer"
          />
          
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/3 border border-white/8 text-white flex items-center justify-center cursor-pointer hover:bg-white hover:text-obsidian hover:border-white transition-all"
            aria-label="Close Lightbox"
          >
            <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Left Navigation */}
          <button
            onClick={handlePrevImage}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/3 border border-white/8 text-white flex items-center justify-center cursor-pointer hover:bg-white hover:text-obsidian hover:border-white transition-all hidden sm:flex"
            aria-label="Previous Image"
          >
            <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Navigation */}
          <button
            onClick={handleNextImage}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/3 border border-white/8 text-white flex items-center justify-center cursor-pointer hover:bg-white hover:text-obsidian hover:border-white transition-all hidden sm:flex"
            aria-label="Next Image"
          >
            <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image & Caption Container */}
          <div className="relative z-10 max-w-[80%] max-h-[80vh] flex flex-col items-center justify-center animate-[scaleIn_0.4s_ease-out]">
            <div className="relative w-full max-h-[70vh] aspect-[4/5] border border-white/8 shadow-2xl rounded-sm overflow-hidden bg-card">
              <Image
                src={filteredGallery[lightboxIndex].src}
                alt={filteredGallery[lightboxIndex].title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 80vw"
              />
            </div>
            <div className="mt-6 text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-serif text-lg md:text-xl">
              <strong>{filteredGallery[lightboxIndex].title}</strong> —{" "}
              <span className="text-gold font-sans text-sm font-semibold uppercase tracking-wider">
                {filteredGallery[lightboxIndex].sub}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
