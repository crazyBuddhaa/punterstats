import React, { useState } from "react";
import {
  Bell,
  Bookmark,
  ChevronDown,
  Compass,
  GraduationCap,
  LineChart,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  User,
  X,
  Zap,
} from "lucide-react";
import type { NavPillar } from "@/types/football";

interface NavigationProps {
  currentPillar: NavPillar;
  onChangePillar: (pillar: NavPillar) => void;
  onOpenSearch: () => void;
  onOpenFavourites: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  savedFavoritesCount: number;
  unreadNotificationsCount: number;
}

export function Navigation({
  currentPillar,
  onChangePillar,
  onOpenSearch,
  onOpenFavourites,
  onOpenNotifications,
  onOpenProfile,
  onOpenSettings,
  onOpenAdmin,
  savedFavoritesCount,
  unreadNotificationsCount,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems: { id: NavPillar; label: string; badge?: string }[] = [
    { id: "home", label: "Home" },
    { id: "matches", label: "Matches" },
    { id: "predictions", label: "Predictions" },
    { id: "analysis", label: "Analysis" },
    { id: "learning", label: "Learning" },
    { id: "teams-players", label: "Teams & Players" },
    { id: "statistics", label: "Statistics" },
    { id: "assist", label: "Bet Assist" },
  ];

  const handleSelectPillar = (pillar: NavPillar) => {
    onChangePillar(pillar);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1713] text-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-8 lg:px-12">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleSelectPillar("home")}
            className="text-xl font-black tracking-tight text-white whitespace-nowrap cursor-pointer transition hover:opacity-90 flex items-center gap-2"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#d7f35f]" />
            PunterStat
          </button>
        </div>

        {/* Zone 2: 7 Main Single-Line Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-white/70">
          {mainNavItems.map((item) => {
            const isActive = currentPillar === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectPillar(item.id)}
                className={`transition-colors hover:text-white hover:underline underline-offset-4 whitespace-nowrap shrink-0 text-sm cursor-pointer ${
                  isActive ? "text-[#d7f35f] font-semibold" : ""
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Secondary Actions & Mobile Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            aria-label="Search fixtures, teams, players and lessons"
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/70 transition hover:border-[#d7f35f]/50 hover:text-white"
          >
            <Search className="h-3.5 w-3.5 text-white/60" />
            <span className="hidden md:inline font-mono text-[11px] text-white/50">Search (⌘K)</span>
          </button>

          {/* Favourites */}
          <button
            onClick={onOpenFavourites}
            aria-label="View Favourites"
            className="relative rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Bookmark className="h-4 w-4" />
            {savedFavoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d7f35f] font-mono text-[10px] font-bold text-[#0b1713]">
                {savedFavoritesCount}
              </span>
            )}
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            aria-label="View Notifications"
            className="relative rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute 1.5 top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#ff7653]" />
            )}
          </button>

          {/* Profile */}
          <button
            onClick={onOpenProfile}
            aria-label="User Profile"
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <User className="h-4 w-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Admin CMS */}
          <button
            onClick={onOpenAdmin}
            aria-label="Admin Content Management"
            title="Content Management"
            className="hidden sm:inline-flex rounded-lg p-2 text-[#d7f35f]/80 transition hover:bg-white/10 hover:text-[#d7f35f]"
          >
            <ShieldCheck className="h-4 w-4" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="xl:hidden rounded-lg p-2 text-white/80 transition hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-white/10 bg-[#0f1d18] px-5 py-4">
          <nav className="flex flex-col gap-2">
            {mainNavItems.map((item) => {
              const isActive = currentPillar === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectPillar(item.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#d7f35f]/15 text-[#d7f35f] font-semibold"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#d7f35f]" />}
                </button>
              );
            })}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="flex items-center gap-1.5 text-[#d7f35f] hover:underline"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin CMS</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="flex items-center gap-1.5 hover:text-white"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Preferences</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
