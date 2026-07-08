"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  tags: string[];
}

export function BlogSearch({ tags }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");
  const activeQuery = searchParams.get("q") ?? "";
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Build the next URL by merging overrides onto the CURRENT browser URL
   * (window.location.search), not the React-state snapshot. This prevents
   * stale snapshot composition when multiple interactions fire in rapid
   * succession before the router has flushed the previous transition.
   */
  function buildUrl(overrides: { tag?: string | null; q?: string | null }) {
    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams(searchParams.toString());

    if ("tag" in overrides) {
      if (overrides.tag) params.set("tag", overrides.tag);
      else params.delete("tag");
    }
    if ("q" in overrides) {
      if (overrides.q) params.set("q", overrides.q);
      else params.delete("q");
    }

    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function handleTag(tag: string | null) {
    startTransition(() => router.push(buildUrl({ tag })));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    startTransition(() => router.push(buildUrl({ q: q || null })));
  }

  function clearSearch() {
    if (inputRef.current) inputRef.current.value = "";
    startTransition(() => router.push(buildUrl({ q: null })));
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e293b]/40" />
        <input
          ref={inputRef}
          type="search"
          defaultValue={activeQuery}
          placeholder="Search articles…"
          aria-label="Search blog articles"
          className={cn(
            "h-9 w-full rounded-lg border border-border bg-white pl-9 pr-9 text-sm text-[#0f172a]",
            "placeholder:text-[#1e293b]/40 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40",
            isPending && "opacity-60"
          )}
        />
        {activeQuery && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1e293b]/40 hover:text-[#1e293b]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {/* Tag pills */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
          <button type="button" onClick={() => handleTag(null)} aria-pressed={!activeTag}>
            <Badge
              variant={!activeTag ? "default" : "outline"}
              className={cn(
                "cursor-pointer text-xs capitalize transition-colors",
                !activeTag
                  ? "bg-[#0d9488] hover:bg-[#0d9488]/90 text-white"
                  : "hover:border-[#0d9488]/40 hover:text-[#0d9488]"
              )}
            >
              All
            </Badge>
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTag(tag)}
              aria-pressed={activeTag === tag}
            >
              <Badge
                variant={activeTag === tag ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs capitalize transition-colors",
                  activeTag === tag
                    ? "bg-[#0d9488] hover:bg-[#0d9488]/90 text-white"
                    : "hover:border-[#0d9488]/40 hover:text-[#0d9488]"
                )}
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
