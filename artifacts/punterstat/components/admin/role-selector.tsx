"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateUserRole } from "@/lib/admin/actions";

const ROLES = [
  { value: "user", label: "User", color: "text-slate-600 bg-slate-100" },
  { value: "premium", label: "Premium", color: "text-amber-700 bg-amber-50" },
  { value: "admin", label: "Admin", color: "text-violet-700 bg-violet-50" },
] as const;

type Role = "user" | "premium" | "admin";

interface RoleSelectorProps {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}

export function RoleSelector({ userId, currentRole, isSelf }: RoleSelectorProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value as Role;
    startTransition(async () => {
      const result = await updateUserRole(userId, role);
      if (!result.success) alert(result.error ?? "Failed to update role.");
    });
  }

  const colorClass = ROLES.find((r) => r.value === currentRole)?.color ?? "text-slate-600 bg-slate-100";

  if (isSelf) {
    return (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${colorClass}`}>
        {currentRole} (you)
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
      <select
        defaultValue={currentRole}
        onChange={handleChange}
        disabled={isPending}
        className={`rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-violet-400 disabled:opacity-50 ${colorClass}`}
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
