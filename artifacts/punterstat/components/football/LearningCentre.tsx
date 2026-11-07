import React, { useState } from "react";
import {
  Award,
  BookCheck,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileQuestion,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers,
  Lightbulb,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { LearningLessonDetail, LearningPath, MatchCaseStudy } from "@/types/football";
import {
  LEARNING_CATEGORIES,
  LEARNING_PATHS,
  COMPREHENSIVE_LESSONS,
  MATCH_CASE_STUDIES,
  GLOSSARY_TERMS,
} from "@/data/footballIntelligenceData";

interface LearningCentreProps {
  completedLessonIds: string[];
  bookmarkedLessonIds: string[];
  onToggleCompleteLesson: (lessonId: string) => void;
  onToggleBookmarkLesson: (lessonId: string) => void;
  activeLessonId?: string;
  onSelectLessonId?: (id: string) => void;
}

type LearningTab = "paths" | "categories" | "lesson-viewer" | "case-studies" | "glossary" | "quiz";

export function LearningCentre({
  completedLessonIds,
  bookmarkedLessonIds,
  onToggleCompleteLesson,
  onToggleBookmarkLesson,
  activeLessonId,
  onSelectLessonId,
}: LearningCentreProps) {
  const [activeTab, setActiveTab] = useState<LearningTab>(activeLessonId ? "lesson-viewer" : "paths");
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    activeLessonId ?? COMPREHENSIVE_LESSONS[0].id
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [glossaryQuery, setGlossaryQuery] = useState<string>("");

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const currentLesson =
    COMPREHENSIVE_LESSONS.find((l) => l.id === selectedLessonId) ?? COMPREHENSIVE_LESSONS[0];

  const handleOpenLesson = (id: string) => {
    setSelectedLessonId(id);
    if (onSelectLessonId) onSelectLessonId(id);
    setActiveTab("lesson-viewer");
    setQuizAnswers({});
    setQuizSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectQuizOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    if (currentLesson.quiz) {
      const allCorrect = currentLesson.quiz.every(
        (q) => quizAnswers[q.id] === q.correctIndex
      );
      if (allCorrect && !completedLessonIds.includes(currentLesson.id)) {
        onToggleCompleteLesson(currentLesson.id);
      }
    }
  };

  const filteredLessons = COMPREHENSIVE_LESSONS.filter((l) => {
    if (selectedCategoryId === "all") return true;
    return l.categoryId === selectedCategoryId;
  });

  const filteredGlossary = GLOSSARY_TERMS.filter((g) => {
    if (!glossaryQuery.trim()) return true;
    const q = glossaryQuery.toLowerCase();
    return g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q);
  });

  const isCurrentCompleted = completedLessonIds.includes(currentLesson.id);
  const isCurrentBookmarked = bookmarkedLessonIds.includes(currentLesson.id);

  return (
    <div className="min-h-screen bg-[#f4f5ef] text-[#0b1713] pb-24">
      {/* Pillar Header */}
      <div className="border-b border-white/10 bg-[#0b1713] text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-10 lg:px-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#d7f35f]">
                05 · Football Education & Analytics University
              </span>
              <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
                Master football statistics & predictive modeling.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                From basic football rules and formations to advanced Poisson distributions, Expected Goals (xG), probability calibration, and Kelly bankroll management.
              </p>
            </div>

            {/* User Learning Progress Box */}
            <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 text-xs font-mono">
              <Trophy className="h-8 w-8 text-[#d7f35f] shrink-0" />
              <div>
                <p className="text-white/60 font-sans">Curriculum Progress</p>
                <p className="text-xl font-bold text-white">
                  {completedLessonIds.length} <span className="text-xs text-white/50 font-normal">lessons completed</span>
                </p>
                <div className="mt-1 h-1.5 w-36 overflow-hidden rounded-full bg-white/10">
                  <div
                    style={{ width: `${Math.min(100, (completedLessonIds.length / 8) * 100)}%` }}
                    className="h-full bg-[#d7f35f]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Tabs Navigation */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-white/10 pt-4">
            {[
              { id: "paths", label: "Learning Paths" },
              { id: "categories", label: "10 Categories" },
              { id: "lesson-viewer", label: `Current Lesson: ${currentLesson.title.slice(0, 24)}...` },
              { id: "case-studies", label: "Match Case Studies" },
              { id: "glossary", label: "Football Dictionary" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as LearningTab)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-[#d7f35f] text-[#0b1713]"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 pt-8">
        {/* ========================================================
            1. PROGRESSIVE LEARNING PATHS
           ======================================================== */}
        {activeTab === "paths" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-[#0b1713]">Structured Progressive Learning Paths</h2>
              <p className="text-xs text-[#0b1713]/60 mt-1">
                Progress step-by-step from beginner football basics to quantitative modelling without cognitive overload.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {LEARNING_PATHS.map((path, idx) => (
                <div
                  key={path.id}
                  className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:border-[#0b1713]"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#0b1713]/60 mb-2">
                      <span className="font-mono font-bold text-[#0f766e]">Level 0{idx + 1}</span>
                      <span className="bg-black/5 px-2 py-0.5 rounded font-semibold">{path.level}</span>
                    </div>

                    <h3 className="text-xl font-black text-[#0b1713] mt-1">{path.title}</h3>
                    <p className="text-xs text-[#0b1713]/70 mt-2 leading-relaxed">{path.description}</p>

                    <div className="mt-5 space-y-2 border-t border-black/5 pt-4 text-xs">
                      <p className="font-bold text-[#0b1713]">Includes {path.lessonIds.length} Core Modules:</p>
                      {path.lessonIds.map((lid) => {
                        const l = COMPREHENSIVE_LESSONS.find((item) => item.id === lid);
                        const isDone = completedLessonIds.includes(lid);
                        return (
                          <div
                            key={lid}
                            onClick={() => handleOpenLesson(lid)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 cursor-pointer transition"
                          >
                            <span className="font-medium text-[#0b1713]">{l?.title ?? lid}</span>
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-[#0f766e]" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-[#0b1713]/30" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                    <span className="text-[11px] text-[#0b1713]/60 font-semibold">Badge: {path.badgeName}</span>
                    <button
                      onClick={() => handleOpenLesson(path.lessonIds[0])}
                      className="text-xs font-bold text-[#0f766e] hover:underline"
                    >
                      Start Path →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            2. ALL 10 CATEGORIES
           ======================================================== */}
        {activeTab === "categories" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#0b1713]">The 10 Curriculum Categories</h2>
                <p className="text-xs text-[#0b1713]/60 mt-0.5">Explore our comprehensive football education taxonomy.</p>
              </div>

              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-bold"
              >
                <option value="all">All 10 Categories</option>
                {LEARNING_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}. {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LEARNING_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:border-[#0b1713]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#0f766e]">Category {cat.code}</span>
                    <span className="text-[11px] font-mono text-[#0b1713]/50">{cat.count} Lessons</span>
                  </div>
                  <h3 className="text-lg font-black text-[#0b1713]">{cat.title}</h3>
                  <p className="text-xs text-[#0b1713]/70 mt-2 leading-relaxed">{cat.desc}</p>

                  <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
                    <button
                      onClick={() => {
                        const match = COMPREHENSIVE_LESSONS.find((l) => l.categoryId === cat.id);
                        if (match) handleOpenLesson(match.id);
                        else setSelectedCategoryId(cat.id);
                      }}
                      className="text-xs font-bold text-[#0b1713] hover:text-[#0f766e] transition"
                    >
                      Explore Lessons →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            3. DEDICATED INTERACTIVE LESSON VIEWER & QUIZ
           ======================================================== */}
        {activeTab === "lesson-viewer" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* Main Lesson Article */}
            <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-10 shadow-sm">
              {/* Lesson Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-5 mb-6">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-[#0f766e]">{currentLesson.category}</span>
                  <span className="text-black/30">·</span>
                  <span className="text-[#0b1713]/60">{currentLesson.difficulty}</span>
                  <span className="text-black/30">·</span>
                  <span className="text-[#0b1713]/60">{currentLesson.estimatedMinutes} min read</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleBookmarkLesson(currentLesson.id)}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 transition"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>{isCurrentBookmarked ? "Saved" : "Bookmark"}</span>
                  </button>
                  <button
                    onClick={() => onToggleCompleteLesson(currentLesson.id)}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                      isCurrentCompleted
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-[#0b1713] text-[#d7f35f]"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isCurrentCompleted ? "Completed" : "Mark as Done"}</span>
                  </button>
                </div>
              </div>

              {/* Title & Summary */}
              <h1 className="text-2xl sm:text-4xl font-black text-[#0b1713] leading-tight">
                {currentLesson.title}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#0b1713]/70 font-medium bg-black/5 p-4 rounded-xl">
                {currentLesson.summary}
              </p>

              {/* Lesson Body Paragraphs */}
              <div className="mt-8 space-y-4 text-sm leading-relaxed text-[#0b1713]/85">
                {currentLesson.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Key Takeaways Card */}
              <div className="mt-10 rounded-xl bg-[#0b1713] text-white p-6">
                <h4 className="text-sm font-bold text-[#d7f35f] uppercase tracking-wider">
                  Key Takeaways
                </h4>
                <div className="mt-3 space-y-2 text-xs text-white/80">
                  {currentLesson.keyTakeaways.map((takeaway, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="text-[#d7f35f] font-bold">✓</span>
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Knowledge Quiz Section */}
              {currentLesson.quiz && currentLesson.quiz.length > 0 && (
                <div className="mt-12 border-t border-black/10 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black text-[#0b1713]">Knowledge Verification Quiz</h3>
                      <p className="text-xs text-[#0b1713]/60">Answer to complete the lesson and earn curriculum credit.</p>
                    </div>
                    <span className="font-mono text-xs bg-black/5 px-2.5 py-1 rounded font-bold">
                      {currentLesson.quiz.length} Questions
                    </span>
                  </div>

                  <div className="space-y-6 mt-6">
                    {currentLesson.quiz.map((q, qIndex) => {
                      const selectedOption = quizAnswers[q.id];
                      const isAnswered = selectedOption !== undefined;
                      const isCorrect = isAnswered && selectedOption === q.correctIndex;

                      return (
                        <div key={q.id} className="rounded-xl border border-black/10 p-5 bg-black/[0.02]">
                          <p className="font-bold text-sm text-[#0b1713]">
                            {qIndex + 1}. {q.question}
                          </p>

                          <div className="mt-4 space-y-2">
                            {q.options.map((opt, optIndex) => {
                              const isThisSelected = selectedOption === optIndex;
                              let btnStyle = "border-black/10 bg-white text-[#0b1713] hover:border-[#0b1713]";

                              if (quizSubmitted) {
                                if (optIndex === q.correctIndex) {
                                  btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                                } else if (isThisSelected) {
                                  btnStyle = "border-rose-500 bg-rose-50 text-rose-900";
                                }
                              } else if (isThisSelected) {
                                btnStyle = "border-[#0b1713] bg-[#0b1713] text-white font-semibold";
                              }

                              return (
                                <button
                                  key={optIndex}
                                  onClick={() => handleSelectQuizOption(q.id, optIndex)}
                                  disabled={quizSubmitted}
                                  className={`w-full text-left p-3 rounded-lg border text-xs transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                                >
                                  <span>{opt}</span>
                                  {quizSubmitted && optIndex === q.correctIndex && (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation after submission */}
                          {quizSubmitted && (
                            <div className={`mt-3 p-3 rounded-lg text-xs ${
                              isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}>
                              <strong>{isCorrect ? "Correct!" : "Incorrect."}</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    {quizSubmitted ? (
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setQuizAnswers({});
                        }}
                        className="rounded-lg border border-black/10 px-4 py-2 text-xs font-semibold text-[#0b1713] hover:bg-black/5"
                      >
                        Retry Quiz
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < currentLesson.quiz.length}
                        className="rounded-lg bg-[#0b1713] px-6 py-2.5 text-xs font-bold text-[#d7f35f] hover:bg-[#17231c] transition disabled:opacity-40"
                      >
                        Submit Answers
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: Other Lessons in Curriculum */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <h4 className="font-bold text-sm text-[#0b1713] mb-3">All Lessons in Curriculum</h4>
                <div className="space-y-1.5">
                  {COMPREHENSIVE_LESSONS.map((l) => {
                    const isSelected = l.id === currentLesson.id;
                    const isDone = completedLessonIds.includes(l.id);

                    return (
                      <button
                        key={l.id}
                        onClick={() => handleOpenLesson(l.id)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between ${
                          isSelected
                            ? "bg-[#0b1713] text-[#d7f35f] font-bold"
                            : "text-[#0b1713]/80 hover:bg-black/5"
                        }`}
                      >
                        <span className="truncate pr-2">{l.title}</span>
                        {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            4. MATCH CASE STUDIES
           ======================================================== */}
        {activeTab === "case-studies" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-[#0b1713]">Real-World Practical Match Case Studies</h2>
              <p className="text-xs text-[#0b1713]/60 mt-0.5">
                Detailed breakdowns of historic tactical clashes, model mispricings, and statistical anomalies.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {MATCH_CASE_STUDIES.map((cs) => (
                <div key={cs.id} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-[#0b1713]/60 mb-2">
                    <span className="font-bold text-[#0f766e]">{cs.theme}</span>
                    <span className="font-mono">{cs.date}</span>
                  </div>

                  <h3 className="text-xl font-black text-[#0b1713] mt-1">{cs.title}</h3>
                  <p className="text-xs font-semibold text-[#0b1713]/70 mt-1">{cs.fixture}</p>
                  <p className="text-xs text-[#0b1713]/80 mt-3 leading-relaxed">{cs.summary}</p>

                  <div className="mt-4 pt-4 border-t border-black/5 space-y-2">
                    <p className="text-xs font-bold text-[#0b1713]">Key Statistical Evidence:</p>
                    <ul className="text-xs text-[#0b1713]/70 list-disc pl-4 space-y-1">
                      {cs.statisticalFindings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/5 text-xs bg-black/5 p-3 rounded-xl">
                    <strong className="text-[#0b1713]">Analytical Lesson:</strong> {cs.lessonsLearned}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            5. FOOTBALL DICTIONARY / GLOSSARY
           ======================================================== */}
        {activeTab === "glossary" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#0b1713]">Football Statistics & Betting Dictionary</h2>
                <p className="text-xs text-[#0b1713]/60 mt-0.5">Definitive terminology definitions with zero marketing jargon.</p>
              </div>

              <input
                type="text"
                placeholder="Search term or metric..."
                value={glossaryQuery}
                onChange={(e) => setGlossaryQuery(e.target.value)}
                className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs text-[#0b1713] w-full sm:w-64 focus:outline-none focus:border-[#0b1713]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredGlossary.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-[#0b1713]">{item.term}</h3>
                    <span className="font-mono text-[10px] bg-black/5 px-2 py-0.5 rounded text-[#0b1713]/60">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#0b1713]/75 leading-relaxed">{item.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
