import { create } from "zustand";

interface UiState {
  isMobileMenuOpen: boolean;
  isSidebarOpen: boolean;
  activeModal: string | null;

  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  isMobileMenuOpen: false,
  isSidebarOpen: true,
  activeModal: null,

  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
