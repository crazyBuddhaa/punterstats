"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  tags: string[];
}

export function TagFilter({ tags }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  function handleTag(tag: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => handleTag(null)}>
        <Badge
          variant={!activeTag ? "default" : "outline"}
          className={cn(
            "cursor-pointer text-xs capitalize transition-colors",
            !activeTag
              ? "bg-[#3D2DFF] hover:bg-[#3D2DFF]/90 text-white"
              : "hover:border-[#3D2DFF]/40 hover:text-[#3D2DFF]"
          )}
        >
          All
        </Badge>
      </button>
      {tags.map((tag) => (
        <button key={tag} onClick={() => handleTag(tag)}>
          <Badge
            variant={activeTag === tag ? "default" : "outline"}
            className={cn(
              "cursor-pointer text-xs capitalize transition-colors",
              activeTag === tag
                ? "bg-[#3D2DFF] hover:bg-[#3D2DFF]/90 text-white"
                : "hover:border-[#3D2DFF]/40 hover:text-[#3D2DFF]"
            )}
          >
            {tag}
          </Badge>
        </button>
      ))}
    </div>
  );
}
