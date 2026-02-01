"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Be_Vietnam_Pro } from "next/font/google";

const beVietnamPro = Be_Vietnam_Pro({
    subsets: ["latin", "vietnamese"],
    weight: ["400", "700", "900"],
});

export default function Celebration() {
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        // Start fireworks on mount
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // since particles fall down, start a bit higher than random
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
        }, 250);

        // Show text with a slight delay for dramatic effect
        const timer = setTimeout(() => {
            setShowText(true);
        }, 500);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        }
    }, []);

    return (
        <div className={`absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden ${beVietnamPro.className}`}>
            <h1
                className={`
            flex flex-col items-center gap-8 md:gap-16
            text-6xl md:text-8xl lg:text-9xl font-black text-center text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600
            drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] 
            transition-all duration-1000 transform
            ${showText ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-90"}
        `}
                style={{
                    WebkitTextStroke: "2px #b91c1c",
                    filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))"
                }}
            >
                <span>VIỆT NAM</span>
                <span>VÔ ĐỊCH</span>
            </h1>
        </div>
    );
}
