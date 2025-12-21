import { create } from "zustand";

interface priceData {
  tickPrice: number;
  dayHigh: number;
  dayLow: number;
  dayOpen: number;
  dayChange: number;

}

interface DataPriceState {
  priceDatas: Record<string, priceData>;
  setPriceDatas: (symbol: string, priceDatas: priceData) => void;
}

const useDataPriceStore = create<DataPriceState>((set) => ({
  priceDatas: {},
  setPriceDatas: (symbol: string, priceDatas: priceData) =>
    set((state) => ({
      priceDatas: {
        ...state.priceDatas,
        [symbol]: priceDatas,
      },
    })),
}));

export default useDataPriceStore;
