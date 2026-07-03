import Link from "next/link";
import Image from "next/image";
import { Calendar, Tag } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/types";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

interface Props {
  post: BlogPost;
  featured?: boolean;
}

export function PostCard({ post, featured = false }: Props) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card className={`h-full overflow-hidden border-border/50 transition-all duration-200 hover:border-[#3D2DFF]/30 hover:shadow-md hover:-translate-y-0.5 ${featured ? "lg:flex lg:flex-row" : ""}`}>
        {/* Thumbnail */}
        <div className={`relative overflow-hidden bg-[#0f172a]/5 ${featured ? "lg:w-80 lg:flex-shrink-0" : "h-44"}`}>
          {post.thumbnailUrl ? (
            <Image
              src={post.thumbnailUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full min-h-[176px] items-center justify-center">
              <Tag className="h-8 w-8 text-[#0f172a]/15" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <CardHeader className="pb-2">
            {post.tags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs font-normal capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <h3 className={`font-semibold text-[#0f172a] leading-snug group-hover:text-[#3D2DFF] transition-colors ${featured ? "text-xl" : "text-base line-clamp-2"}`}>
              {post.title}
            </h3>
          </CardHeader>

          {post.excerpt && (
            <CardContent className="pb-3 pt-0 flex-1">
              <p className="text-sm text-[#1e293b]/60 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            </CardContent>
          )}

          <CardFooter className="pt-0">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#1e293b]/40">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.publishedAt ?? post.createdAt)}
              </span>
              {post.authorName && <span>by {post.authorName}</span>}
            </div>
          </CardFooter>
        </div>
      </Card>
    </Link>
  );
}
