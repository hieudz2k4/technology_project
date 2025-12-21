"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface HotkeyConfig {
  key: string;
  href: string;
  label: string;
}

const HOTKEYS: HotkeyConfig[] = [
  { key: "1", href: "/markets", label: "Markets" },
  { key: "2", href: "/", label: "Trade" },
  { key: "3", href: "/portfolio", label: "Portfolio" },
  { key: "4", href: "/chatbot", label: "AI Chat" },
  { key: "5", href: "/docs", label: "Docs" },
];

export function useHotkeys() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if no modifier keys are pressed and not typing in an input
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (isInput || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return;
      }

      const hotkey = HOTKEYS.find((h) => h.key === e.key);
      if (hotkey) {
        e.preventDefault();
        router.push(hotkey.href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return HOTKEYS;
}
