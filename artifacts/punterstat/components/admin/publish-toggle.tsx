"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface PublishToggleProps {
  id: string;
  isPublished: boolean;
  action: (id: string, published: boolean) => Promise<{ success: boolean; error?: string }>;
}

export function PublishToggle({ id, isPublished, action }: PublishToggleProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await action(id, !isPublished);
      if (!result.success) alert(result.error ?? "Something went wrong.");
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={isPublished ? "Unpublish" : "Publish"}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
        isPublished
          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isPublished ? (
        <Eye className="h-3 w-3" />
      ) : (
        <EyeOff className="h-3 w-3" />
      )}
      {isPublished ? "Live" : "Draft"}
    </button>
  );
}
