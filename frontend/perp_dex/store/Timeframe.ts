import { create } from "zustand";

interface TfState {
  selectedTf: string;
  setSelectedTf: (tf: string) => void;
}
export const useTfStore = create<TfState>((set) => ({
  selectedTf: "1H",
  setSelectedTf: (tf: string) => set(() => ({ selectedTf: tf })),
}));
