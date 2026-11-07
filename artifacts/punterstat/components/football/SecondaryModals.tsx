import React, { useState } from "react";
import {
  Bell,
  Bookmark,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Trophy,
  User,
  X,
} from "lucide-react";
import type { NavPillar } from "@/types/football";
import {
  MATCH_CENTRE_FIXTURES,
  PREDICTIONS_FEED,
  TEAMS_DATA,
  PLAYERS_DATA,
  COMPREHENSIVE_LESSONS,
  GLOSSARY_TERMS,
} from "@/data/footballIntelligenceData";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMatch: (id: string) => void;
  onSelectLesson: (id: string) => void;
  onNavigatePillar: (pillar: NavPillar) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  onSelectMatch,
  onSelectLesson,
  onNavigatePillar,
}: SearchModalProps) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingMatches = q
    ? MATCH_CENTRE_FIXTURES.filter(
        (m) =>
          m.homeTeam.name.toLowerCase().includes(q) ||
          m.awayTeam.name.toLowerCase().includes(q) ||
          m.competition.toLowerCase().includes(q)
      )
    : [];

  const matchingTeams = q
    ? TEAMS_DATA.filter(
        (t) => t.name.toLowerCase().includes(q) || t.league.toLowerCase().includes(q)
      )
    : [];

  const matchingPlayers = q
    ? PLAYERS_DATA.filter(
        (p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q)
      )
    : [];

  const matchingLessons = q
    ? COMPREHENSIVE_LESSONS.filter(
        (l) => l.title.toLowerCase().includes(q) || l.summary.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden text-[#0b1713]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-black/10 px-5 py-4">
          <Search className="h-5 w-5 text-[#0b1713]/40" />
          <input
            type="text"
            placeholder="Search fixtures, teams, players, lessons, glossary..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder:text-black/40"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#0b1713]/40 hover:text-[#0b1713] hover:bg-black/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6">
          {!q ? (
            <div className="text-xs text-[#0b1713]/50 text-center py-8">
              Type at least 2 characters to search across all PunterStat matches, clubs, players, and educational lessons.
            </div>
          ) : (
            <>
              {/* Fixtures Matches */}
              {matchingMatches.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#0b1713]/40 mb-2">
                    Fixtures & Match Centres
                  </p>
                  <div className="space-y-1">
                    {matchingMatches.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onSelectMatch(m.id);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-black/5 transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#0b1713]">{m.homeTeam.name} vs {m.awayTeam.name}</p>
                          <p className="text-[11px] text-[#0b1713]/50">{m.competition} · {m.kickoff}</p>
                        </div>
                        <span className="font-semibold text-[#0f766e]">Match Centre →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lessons Matches */}
              {matchingLessons.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#0b1713]/40 mb-2">
                    Curriculum Lessons
                  </p>
                  <div className="space-y-1">
                    {matchingLessons.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          onSelectLesson(l.id);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-black/5 transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#0b1713]">{l.title}</p>
                          <p className="text-[11px] text-[#0b1713]/50">{l.category} · {l.estimatedMinutes} mins</p>
                        </div>
                        <span className="font-semibold text-[#0f766e]">Open Lesson →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Teams Matches */}
              {matchingTeams.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#0b1713]/40 mb-2">
                    Clubs
                  </p>
                  <div className="space-y-1">
                    {matchingTeams.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onNavigatePillar("teams-players");
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-black/5 transition flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-[#0b1713]">{t.name} ({t.league})</span>
                        <span className="font-semibold text-[#0f766e]">Team Dossier →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No match state */}
              {matchingMatches.length === 0 && matchingLessons.length === 0 && matchingTeams.length === 0 && (
                <div className="text-center py-8 text-xs text-[#0b1713]/60">
                  No direct results found for &quot;{query}&quot;. Try searching for &quot;Liverpool&quot;, &quot;xG&quot;, or &quot;Corners&quot;.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface FavouritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favouriteMatchIds: string[];
  bookmarkedLessonIds: string[];
  onSelectMatch: (id: string) => void;
  onSelectLesson: (id: string) => void;
  onRemoveFavouriteMatch: (id: string) => void;
  onRemoveBookmarkedLesson: (id: string) => void;
}

export function FavouritesDrawer({
  isOpen,
  onClose,
  favouriteMatchIds,
  bookmarkedLessonIds,
  onSelectMatch,
  onSelectLesson,
  onRemoveFavouriteMatch,
  onRemoveBookmarkedLesson,
}: FavouritesDrawerProps) {
  if (!isOpen) return null;

  const favMatches = MATCH_CENTRE_FIXTURES.filter((m) => favouriteMatchIds.includes(m.id));
  const bookmarkedLessons = COMPREHENSIVE_LESSONS.filter((l) => bookmarkedLessonIds.includes(l.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between text-[#0b1713] h-full overflow-y-auto">
        <div>
          <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-[#0f766e]" />
              <h2 className="text-xl font-black">Your Favourites & Bookmarks</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-black/40 hover:text-black">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Matches */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b1713]/50 mb-3">
                Saved Fixtures ({favMatches.length})
              </h3>
              {favMatches.length === 0 ? (
                <p className="text-xs text-[#0b1713]/40 italic">No fixtures saved yet.</p>
              ) : (
                <div className="space-y-2">
                  {favMatches.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-black/10 bg-black/[0.02]"
                    >
                      <button
                        onClick={() => {
                          onSelectMatch(m.id);
                          onClose();
                        }}
                        className="text-left"
                      >
                        <p className="font-bold text-xs text-[#0b1713]">{m.homeTeam.name} vs {m.awayTeam.name}</p>
                        <p className="text-[11px] text-[#0b1713]/50">{m.competition}</p>
                      </button>
                      <button
                        onClick={() => onRemoveFavouriteMatch(m.id)}
                        className="text-[#0b1713]/40 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lessons */}
            <div className="pt-6 border-t border-black/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b1713]/50 mb-3">
                Bookmarked Lessons ({bookmarkedLessons.length})
              </h3>
              {bookmarkedLessons.length === 0 ? (
                <p className="text-xs text-[#0b1713]/40 italic">No lessons bookmarked yet.</p>
              ) : (
                <div className="space-y-2">
                  {bookmarkedLessons.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-black/10 bg-black/[0.02]"
                    >
                      <button
                        onClick={() => {
                          onSelectLesson(l.id);
                          onClose();
                        }}
                        className="text-left"
                      >
                        <p className="font-bold text-xs text-[#0b1713]">{l.title}</p>
                        <p className="text-[11px] text-[#0b1713]/50">{l.category}</p>
                      </button>
                      <button
                        onClick={() => onRemoveBookmarkedLesson(l.id)}
                        className="text-[#0b1713]/40 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-[#0b1713] py-2.5 text-center text-xs font-bold text-[#d7f35f]"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMatch: (matchId: string) => void;
}

export function NotificationsDrawer({ isOpen, onClose, onNavigateToMatch }: NotificationsDrawerProps) {
  if (!isOpen) return null;

  const notifications = [
    {
      id: "notif-1",
      title: "Model Edge Detected: Liverpool vs Arsenal",
      desc: "BTTS Yes probability calibrated at 62% against market odds of 1.75 (+8.6% edge).",
      matchId: "liv-ars",
      time: "10 mins ago",
      unread: true,
    },
    {
      id: "notif-2",
      title: "Corner Surge Alert: Bayern vs Leverkusen",
      desc: "Both clubs averaging over 6.0 corners won per match; Over 10.5 corner probability is 56%.",
      matchId: "fcb-b04",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: "notif-3",
      title: "Lineup Alert: Barcelona",
      desc: "Lewandowski confirmed in starting XI for El Clásico.",
      matchId: "rma-bar",
      time: "3 hours ago",
      unread: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between text-[#0b1713] h-full overflow-y-auto">
        <div>
          <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#0f766e]" />
              <h2 className="text-xl font-black">Model & Fixture Notifications</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-black/40 hover:text-black">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onNavigateToMatch(n.matchId);
                  onClose();
                }}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  n.unread ? "border-[#0f766e]/40 bg-emerald-50/40" : "border-black/10 bg-white"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-[#0b1713]/60 mb-1">
                  <span className="font-semibold text-[#0f766e]">{n.time}</span>
                  {n.unread && <span className="h-2 w-2 rounded-full bg-[#ff7653]" />}
                </div>
                <p className="font-bold text-xs text-[#0b1713]">{n.title}</p>
                <p className="text-xs text-[#0b1713]/70 mt-1 leading-relaxed">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-[#0b1713] py-2.5 text-center text-xs font-bold text-[#d7f35f]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedLessonsCount: number;
}

export function ProfileModal({ isOpen, onClose, completedLessonsCount }: ProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-2xl text-[#0b1713]">
        <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#0b1713] text-[#d7f35f] flex items-center justify-center font-bold text-base">
              PS
            </div>
            <div>
              <h3 className="font-black text-lg">PunterStat Member Profile</h3>
              <p className="text-xs text-[#0b1713]/60">Tier: Quantitative Match Analyst</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-black/40 hover:text-black">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Achievement Summary */}
          <div className="rounded-xl bg-black/5 p-4 grid grid-cols-3 gap-2 text-center font-mono">
            <div>
              <p className="text-[10px] text-[#0b1713]/60 font-sans uppercase">Lessons Done</p>
              <p className="text-2xl font-black text-[#0b1713]">{completedLessonsCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#0b1713]/60 font-sans uppercase">Quiz Accuracy</p>
              <p className="text-2xl font-black text-[#0f766e]">92%</p>
            </div>
            <div>
              <p className="text-[10px] text-[#0b1713]/60 font-sans uppercase">Badges Earned</p>
              <p className="text-2xl font-black text-[#0b1713]">3</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-xs text-[#0b1713]">Earned Academy Badges:</p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#d7f35f]/40 text-[#0b1713] rounded-lg text-xs font-bold font-mono">
                Football Intelligence Cadet
              </span>
              <span className="px-3 py-1 bg-black/5 text-[#0b1713] rounded-lg text-xs font-bold font-mono">
                Poisson Modeller
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-[#0b1713] py-2.5 text-center text-xs font-bold text-[#d7f35f]"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  oddsFormat: "decimal" | "fractional" | "american";
  onChangeOddsFormat: (fmt: "decimal" | "fractional" | "american") => void;
  currency: "GBP" | "USD" | "EUR" | "NGN";
  onChangeCurrency: (cur: "GBP" | "USD" | "EUR" | "NGN") => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  oddsFormat,
  onChangeOddsFormat,
  currency,
  onChangeCurrency,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-2xl text-[#0b1713]">
        <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#0f766e]" />
            <h3 className="font-black text-lg">Platform Preferences</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-black/40 hover:text-black">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs">
          {/* Odds Format */}
          <div>
            <label className="font-bold text-[#0b1713] block mb-2">Default Odds Representation</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "decimal", label: "Decimal (2.18)" },
                { id: "fractional", label: "Fraction (6/5)" },
                { id: "american", label: "American (+118)" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChangeOddsFormat(item.id as any)}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition ${
                    oddsFormat === item.id
                      ? "border-[#0b1713] bg-[#0b1713] text-[#d7f35f]"
                      : "border-black/10 bg-white hover:bg-black/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="font-bold text-[#0b1713] block mb-2">Base Currency</label>
            <div className="grid grid-cols-4 gap-2 font-mono">
              {[
                { id: "GBP", label: "£ GBP" },
                { id: "USD", label: "$ USD" },
                { id: "EUR", label: "€ EUR" },
                { id: "NGN", label: "₦ NGN" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => onChangeCurrency(c.id as any)}
                  className={`p-2 rounded-xl border text-center font-bold transition ${
                    currency === c.id
                      ? "border-[#0b1713] bg-[#0b1713] text-[#d7f35f]"
                      : "border-black/10 bg-white hover:bg-black/5"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-[#0b1713] py-2.5 text-center text-xs font-bold text-[#d7f35f]"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [adminTab, setAdminTab] = useState<"lessons" | "quizzes" | "predictions" | "featured">("lessons");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-2xl text-[#0b1713] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#0f766e]" />
            <div>
              <h3 className="font-black text-xl">Administration & Content Management</h3>
              <p className="text-xs text-[#0b1713]/60">Manage curriculum lessons, quizzes, glossary definitions, and model parameters.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-black/40 hover:text-black">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex gap-2 border-b border-black/10 pb-3 mb-6 text-xs">
          {[
            { id: "lessons", label: "Curriculum Lessons" },
            { id: "quizzes", label: "Quiz Question Bank" },
            { id: "predictions", label: "Model Thresholds" },
            { id: "featured", label: "Featured Fixtures" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setAdminTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                adminTab === t.id ? "bg-[#0b1713] text-[#d7f35f]" : "text-[#0b1713]/60 hover:bg-black/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {adminTab === "lessons" && (
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">Active Curriculum Lessons ({COMPREHENSIVE_LESSONS.length})</span>
              <span className="text-[11px] text-[#0f766e] font-semibold">+ Add New Lesson</span>
            </div>
            {COMPREHENSIVE_LESSONS.map((l) => (
              <div key={l.id} className="p-3 rounded-xl border border-black/10 bg-black/[0.02] flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#0b1713]">{l.title}</p>
                  <p className="text-[11px] text-[#0b1713]/50">{l.category} · {l.difficulty} · {l.estimatedMinutes} mins</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Live</span>
                  <span className="text-xs text-[#0b1713]/60 hover:text-black cursor-pointer">Edit</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {adminTab === "predictions" && (
          <div className="space-y-4 text-xs">
            <p className="text-[#0b1713]/70">
              Configure global prediction calibration parameters, minimum required sample size, and confidence classification rules.
            </p>
            <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02] space-y-3">
              <div className="flex justify-between items-center">
                <span>Minimum sample matches for &quot;High&quot; confidence:</span>
                <span className="font-mono font-bold">15 matches</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Poisson Goal Intensity Scaling Factor (Home Advantage):</span>
                <span className="font-mono font-bold">+1.18×</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Minimum Positive Value Edge for Pick Flag:</span>
                <span className="font-mono font-bold">+3.0%</span>
              </div>
            </div>
          </div>
        )}

        {adminTab === "quizzes" && (
          <div className="space-y-3 text-xs">
            <p className="text-[#0b1713]/70 mb-3">All quiz items have verified correct answers and analytical feedback explanations.</p>
            <div className="p-3 rounded-xl border border-black/10 bg-black/[0.02]">
              <span className="font-bold text-[#0b1713]">Expected Goals (xG) Shot Probability</span>
              <p className="text-[11px] text-[#0b1713]/60 mt-1">2 multiple choice options calibrated with historical shot frequencies.</p>
            </div>
            <div className="p-3 rounded-xl border border-black/10 bg-black/[0.02]">
              <span className="font-bold text-[#0b1713]">Probability vs Confidence Differentiation</span>
              <p className="text-[11px] text-[#0b1713]/60 mt-1">Tests ability to separate probability % from data reliability.</p>
            </div>
          </div>
        )}

        {adminTab === "featured" && (
          <div className="space-y-3 text-xs">
            <p className="text-[#0b1713]/70 mb-3">Featured fixtures highlighted on the Home Intelligence Dashboard.</p>
            <div className="p-3 rounded-xl border border-black/10 bg-black/[0.02] flex justify-between items-center">
              <span className="font-bold">Liverpool vs Arsenal (Premier League)</span>
              <span className="text-emerald-700 font-bold">Slot 1 (Hero)</span>
            </div>
            <div className="p-3 rounded-xl border border-black/10 bg-black/[0.02] flex justify-between items-center">
              <span className="font-bold">Real Madrid vs Barcelona (La Liga)</span>
              <span className="text-emerald-700 font-bold">Slot 2</span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-[#0b1713] py-2.5 text-center text-xs font-bold text-[#d7f35f]"
        >
          Close Admin Console
        </button>
      </div>
    </div>
  );
}

interface ContextualEducationalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  explanation: string;
  lessonId?: string;
  onOpenLesson?: (id: string) => void;
}

export function ContextualEducationalDrawer({
  isOpen,
  onClose,
  title,
  explanation,
  lessonId,
  onOpenLesson,
}: ContextualEducationalDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between text-[#0b1713] h-full overflow-y-auto">
        <div>
          <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#0f766e]" />
              <h3 className="font-black text-lg">Statistical Concept</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-black/40 hover:text-black">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-black text-[#0b1713]">{title}</h4>
            <div className="p-4 rounded-xl bg-black/5 text-xs leading-relaxed text-[#0b1713]/85 space-y-2">
              <p>{explanation}</p>
            </div>

            {lessonId && onOpenLesson && (
              <div className="mt-6 pt-6 border-t border-black/10">
                <p className="text-xs font-bold text-[#0b1713] mb-2">Want to learn deeper?</p>
                <button
                  onClick={() => {
                    onOpenLesson(lessonId);
                    onClose();
                  }}
                  className="w-full rounded-xl bg-[#0b1713] p-3 text-xs font-bold text-[#d7f35f] hover:bg-[#17231c] transition text-center flex items-center justify-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Open Dedicated Learning Module →</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-xl border border-black/10 py-2.5 text-center text-xs font-bold text-[#0b1713] hover:bg-black/5"
        >
          Close
        </button>
      </div>
    </div>
  );
}
