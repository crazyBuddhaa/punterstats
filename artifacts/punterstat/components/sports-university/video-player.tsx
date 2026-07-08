"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface Props {
  url: string;
  title: string;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0`;

  // Already an embed URL
  if (url.includes("/embed/")) return url;

  return null;
}

export function VideoPlayer({ url, title }: Props) {
  const [loaded, setLoaded] = useState(false);
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-[#0f172a]/5 text-sm text-[#1e293b]/50">
        Video unavailable — unsupported URL format.
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#0f172a]">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Play className="h-7 w-7 text-white translate-x-0.5" />
          </div>
        </div>
      )}
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
