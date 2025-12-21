import { create } from "zustand";

interface UserDataState {
    balance: string;
    fetchBalance: (address: string) => Promise<void>;
    setBalance: (balance: string) => void;
}

const useUserDataStore = create<UserDataState>((set) => ({
    balance: "0.00",
    setBalance: (balance: string) => set({ balance }),
    fetchBalance: async (address: string) => {
        try {
            const response = await fetch(`http://localhost:8090/api/user/balance/${address}`);
            const data = await response.json();

            console.log(data);
            if (data && data.balance !== undefined) {
                set({ balance: data.balance.toFixed(2) });
            }
        } catch (error) {
            console.error("Failed to fetch balance:", error);
        }
    },
}));

export default useUserDataStore;
