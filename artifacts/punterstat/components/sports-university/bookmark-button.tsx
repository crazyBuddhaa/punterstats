"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleBookmark } from "@/lib/sports-university/actions";
import { cn } from "@/lib/utils";

interface Props {
  lessonId: string;
  initialBookmarked: boolean;
}

export function BookmarkButton({ lessonId, initialBookmarked }: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleBookmark(lessonId, bookmarked);
      if (result.success) setBookmarked(result.data.bookmarked);
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "gap-2 transition-colors",
        bookmarked
          ? "border-[#3D2DFF]/40 bg-[#3D2DFF]/5 text-[#3D2DFF] hover:bg-[#3D2DFF]/10"
          : "text-[#1e293b]/60 hover:text-[#1e293b]"
      )}
    >
      <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      {bookmarked ? "Saved" : "Save lesson"}
    </Button>
  );
}
