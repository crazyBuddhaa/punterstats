import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile, UserRole } from "@/types";

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
  hasRole: (role: UserRole) => boolean;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  premium: 2,
  admin: 3,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      signOut: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      hasRole: (requiredRole) => {
        const { user } = get();
        if (!user) return false;
        return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
      },
    }),
    {
      name: "punterstat-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
