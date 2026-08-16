import { cookies } from "next/headers";
import { Badge, cn } from "@repo/ui";
import { AdminDataTable } from "components/AdminDataTable";
import { PageHeader } from "components/ui/PageHeader";
import { adminFetch } from "lib/server";

const STATUS_TONE: Record<string, string> = {
  verified: "bg-secondary-container text-primary",
  approved: "bg-secondary-container text-primary",
  rejected: "bg-error/10 text-error",
  expired: "bg-error/10 text-error",
};

function DocBadge({ value }: { value: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-label-sm text-[11px] font-semibold",
        STATUS_TONE[value] ?? "bg-surface-container text-on-surface-variant",
      )}
    >
      {value}
    </Badge>
  );
}

export const dynamic = "force-dynamic";

type DocRow = {
  id: string;
  type: string;
  fileName?: string | null;
  status?: string | null;
  propertyId?: string | null;
  ownerId?: string | null;
  createdAt: string;
  expiresAt?: string | null;
};

export default async function DocumentsPage() {
  const cookie = (await cookies()).toString();
  let rows: DocRow[] = [];
  try {
    rows = await adminFetch<DocRow[]>(cookie, "/api/v1/admin/documents");
  } catch {
    rows = [];
  }

  return (
    <>
      <PageHeader
        icon="article"
        title="Documents"
        description={`${rows.length} documents uploaded across all listings and users.`}
      />
      <section className="mt-lg">
        <AdminDataTable
          minWidth={640}
          columns={["Type", "File", "Status", "Uploaded", "Expires"]}
          empty={rows.length === 0}
          emptyMessage="No documents found."
        >
          {rows.map((d) => (
            <AdminDataTable.Row key={d.id}>
              <AdminDataTable.Cell className="font-medium text-on-surface">{d.type}</AdminDataTable.Cell>
              <AdminDataTable.Cell className="text-on-surface-variant">{d.fileName || d.id.slice(0, 8)}</AdminDataTable.Cell>
              <AdminDataTable.Cell><DocBadge value={d.status || "unknown"} /></AdminDataTable.Cell>
              <AdminDataTable.Cell className="mono-stat text-[12px] text-on-surface-variant">{new Date(d.createdAt).toLocaleDateString()}</AdminDataTable.Cell>
              <AdminDataTable.Cell className="mono-stat text-[12px] text-on-surface-variant">{d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : "—"}</AdminDataTable.Cell>
            </AdminDataTable.Row>
          ))}
        </AdminDataTable>
      </section>
    </>
  );
}
