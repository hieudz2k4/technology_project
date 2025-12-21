import { create } from "zustand";

interface ThemeState {
  selectedTheme: string;
  setSelectedTheme: (newTheme: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  selectedTheme: "dark",
  setSelectedTheme: (newTheme: string) =>
    set(() => ({ selectedTheme: newTheme })),
}));
