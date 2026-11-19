"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

interface ShareArticleButtonsProps {
  title: string;
  light?: boolean;
}

export function ShareArticleButtons({ title, light = false }: ShareArticleButtonsProps) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    if (typeof window === "undefined") return;
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  }

  function shareWhatsApp() {
    if (typeof window === "undefined") return;
    const text = encodeURIComponent(`${title} — ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  const baseCls = light
    ? "inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-medium text-[#1e293b]/70 transition hover:bg-slate-50 hover:text-[#0f172a]"
    : "inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white";

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={copyLink} className={baseCls}>
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <button type="button" onClick={shareWhatsApp} className={baseCls}>
        <Share2 className="h-3.5 w-3.5" />
        WhatsApp
      </button>
    </div>
  );
}
