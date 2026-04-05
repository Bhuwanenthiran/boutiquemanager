import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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

const AUTH_KEY = 'atelier_auth_session';
const VALID_ROLES = new Set(['admin', 'staff']);

/** Session Persistence Helpers */
const saveSession = async (session) => {
    try {
        const data = JSON.stringify(session);
        if (Platform.OS === 'web') {
            localStorage.setItem(AUTH_KEY, data);
        } else {
            await SecureStore.setItemAsync(AUTH_KEY, data);
        }
    } catch (e) {
        // Silently fail in dev/unsupported envs
    }
};

const loadSession = async () => {
    try {
        if (Platform.OS === 'web') {
            const data = localStorage.getItem(AUTH_KEY);
            return data ? JSON.parse(data) : null;
        } else {
            const data = await SecureStore.getItemAsync(AUTH_KEY);
            return data ? JSON.parse(data) : null;
        }
    } catch (e) {
        return null;
    }
};

const clearSession = async () => {
    try {
        if (Platform.OS === 'web') {
            localStorage.removeItem(AUTH_KEY);
        } else {
            await SecureStore.deleteItemAsync(AUTH_KEY);
        }
    } catch (e) {
        // ignore
    }
};

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
     * Restores user and role from SecureStore.
     */
    initSession: async () => {
        set({ isInitializing: true });
        try {
            const session = await loadSession();
            if (session && session.user && VALID_ROLES.has(session.role)) {
                set({
                    user: session.user,
                    role: session.role,
                    isAuthenticated: true,
                });
            }
        } catch (e) {
            // Restore failed, stay logged out
        } finally {
            set({ isInitializing: false });
        }
    },

    /**
     * Login — validates credentials, sets user + role atomically.
     * Role is derived from the service response, never from user input.
     * Persists session to SecureStore.
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

            // Persist
            await saveSession({ user, role });

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
     * Also clears persisted session.
     */
    logout: async () => {
        set({ isLoading: true });
        try {
            await clearSession();
        } finally {
            set({
                user: null,
                role: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    },
}));

