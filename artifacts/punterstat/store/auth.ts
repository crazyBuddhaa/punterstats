import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile, UserRole } from "@/types";

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /**
   * Becomes true after the Zustand persist middleware has rehydrated state
   * from localStorage. Components that render auth-dependent UI (e.g. Navbar
   * avatars, dashboard links) should gate on this flag to avoid a brief
   * mismatch between the SSR render (always unauthenticated) and the first
   * client frame (which may already have a persisted user).
   */
  _hasHydrated: boolean;

  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
  hasRole: (role: UserRole) => boolean;
  setHasHydrated: (value: boolean) => void;
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
      _hasHydrated: false,

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

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "punterstat-auth",
      // Only persist user — all derived state is recomputed on rehydration.
      // _hasHydrated is intentionally excluded: it is always false on the
      // initial SSR render and must be set via setState after rehydration.
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Sync derived fields from the restored user value.
          state.isAuthenticated = state.user !== null;
          state.isLoading = false;
        }
        // Call setState directly so all subscribers are notified.
        // This runs after the store is fully initialised, so the circular
        // reference to useAuthStore is safe (closures capture the reference,
        // not the value at definition time).
        useAuthStore.setState({ _hasHydrated: true });
      },
    }
  )
);

/**
 * Hook that returns true once the Zustand auth store has rehydrated from
 * localStorage. Use this to defer auth-dependent rendering and avoid
 * SSR/client hydration mismatches in the Navbar and dashboard sidebar.
 *
 * Example:
 *   const hydrated = useAuthHydrated();
 *   if (!hydrated) return <Skeleton />;
 */
export function useAuthHydrated(): boolean {
  return useAuthStore((s) => s._hasHydrated);
}
