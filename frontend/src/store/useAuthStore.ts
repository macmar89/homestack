import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    username: string;
    isSuperadmin: boolean;
    organizations: Array<{ id: string; name: string; slug: string; role: string }>;
}

interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            logout: () => {
                set({ user: null });
                localStorage.removeItem('auth-storage');
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);