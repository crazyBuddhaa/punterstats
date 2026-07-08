import { requireAdmin } from "@/lib/auth/helpers";
import { getAllUsers } from "@/lib/admin/queries";
import { RoleSelector } from "@/components/admin/role-selector";
import { Users, Calendar } from "lucide-react";

export default async function AdminUsersPage() {
  const profile = await requireAdmin();
  const users = await getAllUsers();

  const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Users</h1>
          <p className="mt-1 text-sm text-[#1e293b]/60">
            {users.length} registered user{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          {Object.entries(roleCounts).map(([role, count]) => (
            <span
              key={role}
              className={`rounded-full px-2.5 py-1 capitalize ${
                role === "admin"
                  ? "bg-violet-50 text-violet-700"
                  : role === "premium"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {count} {role}
            </span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-8 w-8 text-[#1e293b]/20" />
            <p className="font-semibold text-[#0f172a]">No users yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-[#1e293b]/50">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.userId} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                          {(user.displayName ?? "?").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[#0f172a]">
                            {user.displayName ?? <span className="italic text-[#1e293b]/40">No name</span>}
                          </p>
                          <p className="font-mono text-[11px] text-[#1e293b]/40">{user.userId.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleSelector
                        userId={user.userId}
                        currentRole={user.role}
                        isSelf={user.userId === profile.userId}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          user.plan === "premium"
                            ? "bg-amber-50 text-amber-700"
                            : user.plan === "pro"
                            ? "bg-violet-50 text-violet-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-xs text-[#1e293b]/50">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
