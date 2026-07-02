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
      // Start false — rehydration sets user synchronously, so there is no
      // window where user is null and isLoading is true during hydration.
      // Callers that need to wait for a server-side session check should call
      // setLoading(true) explicitly and then setUser() to clear it.
      isLoading: false,
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
      // Only persist user — derived state is recomputed on rehydration
      partialize: (state) => ({ user: state.user }),
      // After rehydration, sync isAuthenticated from the restored user value
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = state.user !== null;
          state.isLoading = false;
        }
      },
    }
  )
);
