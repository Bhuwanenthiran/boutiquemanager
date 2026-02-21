import { create } from 'zustand';

export const useThemeStore = create((set) => ({
    isDark: false,
    toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
}));
