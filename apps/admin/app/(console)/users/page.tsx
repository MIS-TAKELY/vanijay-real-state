"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Icon, Input, toast } from "@repo/ui";
import { AdminDataTable } from "components/AdminDataTable";
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

  const loadRef = useRef(load);
  loadRef.current = load;
  useEffect(() => {
    const t = setTimeout(loadRef.current, 300);
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
        <AdminDataTable
          minWidth={720}
          columns={["Name", "Email", "Roles", "Joined", "Actions"]}
          loading={loading}
          empty={!loading && rows.length === 0}
          emptyMessage="No users found."
        >
          {rows.map((u) => (
            <AdminDataTable.Row key={u.id}>
              <AdminDataTable.Cell className="font-medium text-on-surface">
                <div className="flex items-center gap-sm">
                  {u.image ? <img src={u.image} alt="" className="h-7 w-7 rounded-full" /> : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-on-primary text-xs font-bold">{u.name.charAt(0)}</span>}
                  {u.name}
                </div>
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="text-on-surface-variant">{u.email}</AdminDataTable.Cell>
              <AdminDataTable.Cell>
                <div className="flex flex-wrap gap-1">
                  {u.role.map((r) => (
                    <span key={r} className="inline-flex rounded-full bg-surface-container px-2 py-0.5 font-label-sm text-[11px] font-semibold text-on-surface-variant">{r}</span>
                  ))}
                </div>
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="mono-stat text-[12px] text-on-surface-variant">{new Date(u.createdAt).toLocaleDateString()}</AdminDataTable.Cell>
              <AdminDataTable.Cell>
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
              </AdminDataTable.Cell>
            </AdminDataTable.Row>
          ))}
        </AdminDataTable>
      </section>
    </>
  );
}
