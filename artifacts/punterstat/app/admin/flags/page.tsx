import { requireAdmin } from "@/lib/auth/helpers";
import { getFeatureFlags } from "@/lib/admin/queries";
import { FlagToggle } from "@/components/admin/flag-toggle";
import { ToggleLeft } from "lucide-react";

export default async function AdminFlagsPage() {
  await requireAdmin();
  const flags = await getFeatureFlags();

  const enabled = flags.filter((f) => f.enabled).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Feature Flags</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          {enabled} of {flags.length} flag{flags.length !== 1 ? "s" : ""} enabled
        </p>
      </div>

      {flags.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <ToggleLeft className="mb-3 h-8 w-8 text-[#1e293b]/20" />
          <p className="font-semibold text-[#0f172a]">No feature flags found</p>
          <p className="mt-1 text-sm text-[#1e293b]/50">Run migration 001 to seed default flags.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <FlagToggle key={flag.key} flag={flag} />
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-amber-50 px-5 py-4">
        <p className="text-sm font-medium text-amber-800">
          ⚠️ Changes take effect immediately for all users. Toggle with care.
        </p>
      </div>
    </div>
  );
}
