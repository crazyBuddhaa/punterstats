"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markLessonComplete } from "@/lib/sports-university/actions";
import { cn } from "@/lib/utils";

interface Props {
  lessonId: string;
  categorySlug: string;
  courseSlug: string;
  initialCompleted: boolean;
}

export function CompleteButton({ lessonId, categorySlug, courseSlug, initialCompleted }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    if (completed) return;
    startTransition(async () => {
      const result = await markLessonComplete(lessonId, categorySlug, courseSlug);
      if (result.success) setCompleted(true);
    });
  }

  if (completed) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
        <CheckCircle2 className="h-4 w-4" />
        Lesson completed
      </div>
    );
  }

  return (
    <Button
      onClick={handleComplete}
      disabled={isPending}
      className="gap-2 bg-[#3D2DFF] hover:bg-[#3D2DFF]/90"
    >
      <CheckCircle2 className={cn("h-4 w-4", isPending && "animate-pulse")} />
      {isPending ? "Saving…" : "Mark as complete"}
    </Button>
  );
}
