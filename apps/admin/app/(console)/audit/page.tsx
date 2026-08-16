import { cookies } from "next/headers";
import { Badge, cn } from "@repo/ui";
import { AdminDataTable } from "components/AdminDataTable";
import { PageHeader } from "components/ui/PageHeader";
import { AuditRow } from "lib/api";
import { adminFetch } from "lib/server";

const ACTION_TONE: Record<string, string> = {
  delete: "bg-error/10 text-error",
  reject: "bg-error/10 text-error",
  disable: "bg-error/10 text-error",
  publish: "bg-secondary-container text-primary",
};

function ActionBadge({ value }: { value: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-label-sm text-[11px] font-semibold",
        ACTION_TONE[value] ?? "bg-surface-container text-on-surface-variant",
      )}
    >
      {value}
    </Badge>
  );
}

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const cookie = (await cookies()).toString();
  let rows: AuditRow[] = [];
  try {
    rows = await adminFetch<AuditRow[]>(cookie, "/api/v1/admin/audit-log?take=200");
  } catch {
    rows = [];
  }

  return (
    <>
      <PageHeader
        icon="receipt_long"
        title="Audit Log"
        description="Every admin mutation (creates, edits, publishes, role changes) with actor and timestamp."
      />
      <section className="mt-lg">
        <AdminDataTable
          minWidth={720}
          columns={["Time", "Actor", "Action", "Entity", "Summary"]}
          empty={rows.length === 0}
          emptyMessage="No audit records yet."
        >
          {rows.map((r) => (
            <AdminDataTable.Row key={r.id}>
              <AdminDataTable.Cell className="mono-stat text-[12px] text-on-surface-variant">{new Date(r.createdAt).toLocaleString()}</AdminDataTable.Cell>
              <AdminDataTable.Cell className="text-on-surface">{r.actor?.name || r.actor?.email}</AdminDataTable.Cell>
              <AdminDataTable.Cell><ActionBadge value={r.action} /></AdminDataTable.Cell>
              <AdminDataTable.Cell className="mono-stat text-[12px] text-on-surface-variant">{r.entity}</AdminDataTable.Cell>
              <AdminDataTable.Cell className="text-on-surface-variant">{r.summary}</AdminDataTable.Cell>
            </AdminDataTable.Row>
          ))}
        </AdminDataTable>
      </section>
    </>
  );
}
