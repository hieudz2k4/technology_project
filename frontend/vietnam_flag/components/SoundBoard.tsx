"use client";

import { useEffect, useRef } from "react";

export default function SoundBoard({ onInteraction }: { onInteraction?: () => void }) {
    const audioCtxRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
        }

        // Cleanup
        return () => {
            audioCtxRef.current?.close();
        }
    }, []);

    const unlockAudio = () => {
        if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        // Trigger interaction callback to open modal or other effects
        if (onInteraction) {
            onInteraction();
        }
    };

    const playVuvuzela = () => {
        unlockAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        // Vuvuzela base freq usually ~233Hz (Bb3)
        osc.frequency.setValueAtTime(233, ctx.currentTime);

        // Add some "jitter" for realism
        osc.frequency.linearRampToValueAtTime(235, ctx.currentTime + 0.1);
        osc.frequency.linearRampToValueAtTime(230, ctx.currentTime + 0.5);
        osc.frequency.linearRampToValueAtTime(233, ctx.currentTime + 1.0);

        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 2.0);
    };

    const playDrums = () => {
        unlockAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        // Drum Roll Simulation
        // Multiple rapid kicks
        const now = ctx.currentTime;
        for (let i = 0; i < 8; i++) {
            const t = now + i * 0.1;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.setValueAtTime(150, t);
            osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.1);

            gain.gain.setValueAtTime(1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.1);
        }
    };

    const playSiren = () => {
        unlockAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        // Siren sweep
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.5);
        osc.frequency.linearRampToValueAtTime(600, now + 1.0);
        osc.frequency.linearRampToValueAtTime(1200, now + 1.5);
        osc.frequency.linearRampToValueAtTime(600, now + 2.0);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 2.0);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.0);
    };

    const playChant = () => {
        unlockAudio();
        const utterance = new SpeechSynthesisUtterance("Việt Nam Vô Địch");
        utterance.lang = "vi-VN";
        utterance.rate = 1.2; // faster/excited
        utterance.pitch = 1.2; // higher pitch
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="absolute bottom-10 left-0 right-0 z-50 flex flex-wrap items-center justify-center gap-4 pointer-events-auto">
            <SoundButton label="🎺 Vuvuzela" onClick={playVuvuzela} color="bg-yellow-500" />
            <SoundButton label="🥁 Trống" onClick={playDrums} color="bg-red-600" />
            <SoundButton label="🗣️ Hô Vang" onClick={playChant} color="bg-orange-500" />
            <SoundButton label="🚨 Còi" onClick={playSiren} color="bg-blue-600" />
        </div>
    );
}

const SoundButton = ({ label, onClick, color }: { label: string; onClick: () => void; color: string }) => {
    return (
        <button
            onClick={onClick}
            className={`
                px-6 py-4 rounded-full font-bold text-white shadow-lg 
                transform transition-all active:scale-90 hover:scale-105 hover:brightness-110
                border-2 border-white/20 backdrop-blur-sm
                ${color}
            `}
        >
            {label}
        </button>
    )
}
