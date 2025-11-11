import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserStore = {
  email: string | null;
  setEmail: (email: string) => void;
  logout: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      email: null,
      setEmail: (email: string) => {
        set({ email });
      },
      logout: () => {
        set({ email: null });
      },
    }),
    {
      name: "user-storage",
    }
  )
);

// Hook for easy access
export const useUser = () => useUserStore();
