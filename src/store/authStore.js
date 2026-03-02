import { create } from 'zustand';

/**
 * AuthStore — manages authentication state.
 *
 * ARCHITECTURE: Screen → AuthStore → AuthService (future Firebase auth)
 *
 * State:
 *   - user: { id, name, email }  | null
 *   - role: 'admin' | 'staff'    | null
 *   - isAuthenticated: boolean
 *   - isLoading: boolean  — true while login/logout is in-flight
 *   - isInitializing: boolean — true while checking persisted session on boot
 *   - error: string | null
 *
 * Security rules:
 *   - role is set ONLY by the auth service response, never from user input
 *   - isAuthenticated && role must BOTH be non-null for protected screens to render
 *   - logout clears ALL auth state atomically
 */

const VALID_ROLES = new Set(['admin', 'staff']);

/** Simulate network auth call — swap with Firebase Auth in production */
async function mockAuthService(email, password) {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail === 'admin@atelier.com' && password === 'admin123') {
        return { user: { id: '1', name: 'Admin User', email: trimmedEmail }, role: 'admin' };
    }
    if (trimmedEmail === 'staff@atelier.com' && password === 'staff123') {
        return { user: { id: '2', name: 'Staff User', email: trimmedEmail }, role: 'staff' };
    }

    throw new Error('Invalid email or password. Please try again.');
}

export const useAuthStore = create((set, get) => ({
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: false,
    isInitializing: true, // true on boot — prevents navigation flicker
    error: null,

    clearError: () => set({ error: null }),

    /**
     * Called once on app boot to restore persisted session.
     * Currently no-op (mock data has no persistence).
     * Swap with AsyncStorage / SecureStore read in production.
     */
    initSession: async () => {
        // In production: read token from SecureStore, validate with backend
        // For now, always start logged out
        set({ isInitializing: false });
    },

    /**
     * Login — validates credentials, sets user + role atomically.
     * Role is derived from the service response, never from user input.
     */
    login: async (email, password) => {
        if (get().isLoading) return; // Debounce duplicate calls
        set({ isLoading: true, error: null });

        try {
            const { user, role } = await mockAuthService(email, password);

            // Guard: only accept known roles
            if (!VALID_ROLES.has(role)) {
                throw new Error('Unauthorised: unknown role returned from server.');
            }

            set({ user, role, isAuthenticated: true, isLoading: false, error: null });
        } catch (err) {
            set({
                isLoading: false,
                error: err.message || 'Login failed. Please try again.',
                user: null,
                role: null,
                isAuthenticated: false,
            });
            throw err;
        }
    },

    /**
     * Logout — clears ALL auth state atomically.
     * In production: also invalidate session token on backend.
     */
    logout: () => {
        set({
            user: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    },
}));
