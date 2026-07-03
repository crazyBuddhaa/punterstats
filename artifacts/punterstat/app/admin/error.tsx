"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
        <p className="mt-1 text-sm text-red-600/80">
          {process.env.NODE_ENV === "development"
            ? error.message
            : "An unexpected error occurred. Please try again or contact support."}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-[11px] text-red-400">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <Button
        variant="outline"
        onClick={reset}
        className="border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
      >
        Try again
      </Button>
    </div>
  );
}
