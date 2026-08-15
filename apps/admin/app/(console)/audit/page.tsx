import { cookies } from "next/headers";
import { PageHeader } from "components/ui/PageHeader";
import { AuditRow } from "lib/api";
import { adminFetch } from "lib/server";

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
        <div className="admin-surface border border-outline-variant rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-outline-variant bg-surface-container-low font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
                <tr>
                  <th className="px-md py-3">Time</th>
                  <th className="px-md py-3">Actor</th>
                  <th className="px-md py-3">Action</th>
                  <th className="px-md py-3">Entity</th>
                  <th className="px-md py-3">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-md py-lg text-center text-on-surface-variant">No audit records yet.</td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-container/60">
                      <td className="mono-stat px-md py-3 text-[12px] text-on-surface-variant">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="px-md py-3 text-on-surface">{r.actor?.name || r.actor?.email}</td>
                      <td className="px-md py-3"><Badge value={r.action} /></td>
                      <td className="mono-stat px-md py-3 text-[12px] text-on-surface-variant">{r.entity}</td>
                      <td className="px-md py-3 text-on-surface-variant">{r.summary}</td>
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

function Badge({ value }: { value: string }) {
  const tone =
    value === "delete" ? "text-error bg-error/10" :
    value === "publish" ? "text-primary bg-secondary-container" :
    value === "reject" || value === "disable" ? "text-error bg-error/10" :
    "bg-surface-container text-on-surface-variant";
  return <span className={"inline-flex rounded-full px-2 py-0.5 font-label-sm text-[11px] font-semibold " + tone}>{value}</span>;
}
