import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";

const TEXT_BASE = "M-nesiC";
const TEXT_ALT_ONE = "C-nesiM";
const TEXT_ALT_TWO = "N-MeciS";
const SCRAMBLE_CHARS = "0123456789#@$%&";

const SequentialScanner = () => {
  const containerRef = useRef(null);
  const barRef = useRef(null);
  const textRef = useRef(null);
  const [displayText, setDisplayText] = useState(TEXT_BASE);
  const [colorClass, setColorClass] = useState("base");
  const scramble = (newText, newColorClass, duration = 0.2) => {
    const fromText = currentTextRef.current;
    const totalChars = Math.max(fromText.length, newText.length);
    const delay = 0.05;
    setColorClass(newColorClass);
    currentTextRef.current = newText;
    return gsap.to(
      {},
      {
        duration: duration,
        onUpdate: function () {
          const progress = this.progress();
          let scrambled = "";

          for (let i = 0; i < totalChars; i++) {
            if (Math.random() < progress) {
              scrambled += newText[i] || "";
            } else {
              scrambled +=
                SCRAMBLE_CHARS[
                  Math.floor(Math.random() * SCRAMBLE_CHARS.length)
                ];
            }
          }
          setDisplayText(scrambled);
        },
        onComplete: () => {
          setDisplayText(newText);
        },
      }
    );
  };
  const currentTextRef = useRef(TEXT_BASE);
  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
    const targetBar = barRef.current;
    gsap.set(targetBar, { yPercent: -100, opacity: 0 });
    tl.to(targetBar, { opacity: 1, duration: 0.1 }, 0) // Barre apparaît
      .to(targetBar, { yPercent: 100, duration: 1.7, ease: "linear" }, 0.1) // Barre descend (1.7s)
      .add(scramble(TEXT_ALT_ONE, "alt-one", 0.3), 0.7) // Scramble commence
      .to(targetBar, { opacity: 0, duration: 0.1 }, 1.8); // Barre disparaît

    /* PHASE 2 : TEXTE N-MeciS (Scan Up) (2s - 4s) */
    tl.to(targetBar, { yPercent: -100, duration: 0 }, 2) // Reset rapide en haut
      .to(targetBar, { opacity: 1, duration: 0.1 }, 2.05) // Barre apparaît
      .to(targetBar, { yPercent: 0, duration: 1.7, ease: "linear" }, 2.15) // Barre remonte
      .add(scramble(TEXT_ALT_TWO, "alt-two", 0.3), 2.7) // Scramble commence
      .to(targetBar, { opacity: 0, duration: 0.1 }, 3.8); // Barre disparaît

    /* PHASE 3 : TEXTE C-nesiM (Scan Down Répété) (4s - 6s) */
    tl.to(targetBar, { yPercent: -100, duration: 0 }, 4) // Reset en haut
      .to(targetBar, { opacity: 1, duration: 0.1 }, 4.05)
      .to(targetBar, { yPercent: 100, duration: 1.7, ease: "linear" }, 4.15)
      .add(scramble(TEXT_ALT_ONE, "alt-one", 0.3), 4.7)
      .to(targetBar, { opacity: 0, duration: 0.1 }, 5.8);

    /* PHASE 4 : TEXTE M-nesiC (Retour au texte stable) (6s - 8s) */
    tl.to(targetBar, { yPercent: -100, duration: 0 }, 6) // Reset en haut
      .to(targetBar, { opacity: 1, duration: 0.1 }, 6.05)
      .to(targetBar, { yPercent: 0, duration: 1.7, ease: "linear" }, 6.15)
      .add(scramble(TEXT_BASE, "base", 0.3), 6.7)
      .to(targetBar, { opacity: 0, duration: 0.1 }, 7.8);

    return () => {
      tl.kill();
    };
  }, []);
  return (
    <em className="sequential-scanner" ref={containerRef}>
      <span ref={barRef} className="scanner-bar-line" aria-hidden="true"></span>
      <span className={`glitch-text-output ${colorClass}`}>{displayText}</span>
    </em>
  );
};

export default SequentialScanner;
