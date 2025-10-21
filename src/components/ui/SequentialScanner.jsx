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
    gsap.set(targetBar, { opacity: 1 });
    const toggleBar = (startTime, duration) => {
        tl.call(() => {
            targetBar.classList.add('is-animated');
        }, null, startTime);
        tl.call(() => {
            targetBar.classList.remove('is-animated');
        }, null, startTime + duration);
        tl.to(targetBar, { opacity: 0.1, duration: 0.05, yoyo: true, repeat: 1 }, startTime);
    };

    toggleBar(0.7, 0.3);
    tl.add(scramble(TEXT_ALT_ONE, "alt-one", 0.3), 0.7);
    toggleBar(2.7, 0.3);
    tl.add(scramble(TEXT_ALT_TWO, "alt-two", 0.3), 2.7);
    toggleBar(4.7, 0.3);
    tl.add(scramble(TEXT_ALT_ONE, "alt-one", 0.3), 4.7);
    toggleBar(6.7, 0.3);
    tl.add(scramble(TEXT_BASE, "base", 0.3), 6.7);    
    return () => {
      tl.kill();
    };
}, []);

export default SequentialScanner;
