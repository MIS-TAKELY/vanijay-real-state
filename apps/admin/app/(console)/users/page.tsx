"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Icon, Input, toast } from "@repo/ui";
import { PageHeader } from "components/ui/PageHeader";
import { adminUsers, AdminUser } from "lib/api";
import { apiFetch } from "lib/api";

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await adminUsers(q || undefined));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function toggleRole(user: AdminUser, role: string) {
    const next = user.role.includes(role)
      ? user.role.filter((r) => r !== role)
      : [...user.role, role];
    try {
      await apiFetch(`/api/v1/admin/users/${user.id}/roles`, { method: "PATCH", body: { roles: next } });
      toast.success(`Updated roles for ${user.name}`);
      load();
    } catch {
      toast.error("Failed to update roles");
    }
  }

  return (
    <>
      <PageHeader
        icon="manage_accounts"
        title="Users & Agents"
        description={`${rows.length} registered accounts`}
      />
      <section className="mt-lg">
        <div className="mb-md">
          <Input
            placeholder="Search by name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full max-w-xs bg-surface"
          />
        </div>
        <div className="admin-surface border border-outline-variant rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-outline-variant bg-surface-container-low font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
                <tr>
                  <th className="px-md py-3">Name</th>
                  <th className="px-md py-3">Email</th>
                  <th className="px-md py-3">Roles</th>
                  <th className="px-md py-3">Joined</th>
                  <th className="px-md py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {loading ? (
                  <tr><td colSpan={5} className="px-md py-lg text-center text-on-surface-variant">Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={5} className="px-md py-lg text-center text-on-surface-variant">No users found.</td></tr>
                ) : (
                  rows.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container/60">
                      <td className="px-md py-3 font-medium text-on-surface">
                        <div className="flex items-center gap-sm">
                          {u.image ? <img src={u.image} alt="" className="h-7 w-7 rounded-full" /> : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-on-primary text-xs font-bold">{u.name.charAt(0)}</span>}
                          {u.name}
                        </div>
                      </td>
                      <td className="px-md py-3 text-on-surface-variant">{u.email}</td>
                      <td className="px-md py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.role.map((r) => (
                            <span key={r} className="inline-flex rounded-full bg-surface-container px-2 py-0.5 font-label-sm text-[11px] font-semibold text-on-surface-variant">{r}</span>
                          ))}
                        </div>
                      </td>
                      <td className="mono-stat px-md py-3 text-[12px] text-on-surface-variant">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-md py-3">
                        <div className="flex gap-xs">
                          {["ADMIN", "SELLER", "VERIFIER"].map((role) => (
                            <Button
                              key={role}
                              variant={u.role.includes(role) ? "default" : "outline"}
                              size="sm"
                              className="text-[10px] px-2 py-1 h-auto"
                              onClick={() => toggleRole(u, role)}
                            >
                              {role}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
