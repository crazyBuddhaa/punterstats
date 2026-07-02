"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { updateProfile } from "@/lib/dashboard/actions";
import type { UserProfile } from "@/types";

interface ProfileFormProps {
  profile: UserProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
          Display Name
        </label>
        <input
          name="display_name"
          type="text"
          defaultValue={profile.displayName ?? ""}
          required
          maxLength={80}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
          Bio <span className="text-[#1e293b]/40 font-normal">(optional)</span>
        </label>
        <textarea
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={profile.bio ?? ""}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          placeholder="Tell us a little about yourself…"
        />
        <p className="mt-1 text-xs text-[#1e293b]/40">Max 500 characters</p>
      </div>

      {/* Read-only fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Account Role</label>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-slate-50 px-3 py-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                profile.role === "admin"
                  ? "bg-violet-100 text-violet-700"
                  : profile.role === "premium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {profile.role}
            </span>
            <span className="text-xs text-[#1e293b]/40">Cannot be changed here</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Member Since</label>
          <div className="rounded-lg border border-border bg-slate-50 px-3 py-2 text-sm text-[#1e293b]/60">
            {new Date(profile.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Feedback */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Profile updated successfully.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
