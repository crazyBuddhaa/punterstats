"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[PunterStat Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>

      <h1 className="mb-2 text-2xl font-bold text-[#0f172a]">Something went wrong</h1>
      <p className="mb-8 max-w-sm text-sm text-[#1e293b]/60 leading-relaxed">
        An unexpected error occurred. Our team has been notified. You can try
        again or return to the homepage.
      </p>

      {process.env.NODE_ENV === "development" && error.message && (
        <pre className="mb-6 max-w-lg overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-left text-xs text-red-700">
          {error.message}
        </pre>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
