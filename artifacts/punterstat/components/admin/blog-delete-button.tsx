"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface BlogDeleteButtonProps {
  id: string;
  title: string;
  action: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function BlogDeleteButton({ id, title, action }: BlogDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await action(id);
      if (!result.success) alert(result.error ?? "Failed to delete post.");
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title="Delete post"
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-[#1e293b]/50 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
