import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    role: null, // 'admin' or 'staff'
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    login: async (email, password) => {
        set({ isLoading: true, error: null });

        // Mock authentication logic
        // Admin: admin@atelier.com / admin123
        // Staff: staff@atelier.com / staff123

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'admin@atelier.com' && password === 'admin123') {
                    const userData = { id: '1', name: 'Admin User', email };
                    set({
                        user: userData,
                        isAuthenticated: true,
                        role: 'admin',
                        isLoading: false
                    });
                    resolve(userData);
                } else if (email === 'staff@atelier.com' && password === 'staff123') {
                    const userData = { id: '2', name: 'Staff User', email };
                    set({
                        user: userData,
                        isAuthenticated: true,
                        role: 'staff',
                        isLoading: false
                    });
                    resolve(userData);
                } else {
                    const message = 'Invalid email or password. Please try again.';
                    set({ isLoading: false, error: message });
                    reject(new Error(message));
                }
            }, 1000);
        });
    },

    logout: () => {
        set({ user: null, isAuthenticated: false, role: null });
    },
}));
