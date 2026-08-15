import { cookies } from "next/headers";
import { PageHeader } from "components/ui/PageHeader";
import { adminFetch } from "lib/server";

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
        <div className="admin-surface border border-outline-variant rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-outline-variant bg-surface-container-low font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
                <tr>
                  <th className="px-md py-3">Type</th>
                  <th className="px-md py-3">File</th>
                  <th className="px-md py-3">Status</th>
                  <th className="px-md py-3">Uploaded</th>
                  <th className="px-md py-3">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {rows.length === 0 ? (
                  <tr><td colSpan={5} className="px-md py-lg text-center text-on-surface-variant">No documents found.</td></tr>
                ) : (
                  rows.map((d) => (
                    <tr key={d.id} className="hover:bg-surface-container/60">
                      <td className="px-md py-3 font-medium text-on-surface">{d.type}</td>
                      <td className="px-md py-3 text-on-surface-variant">{d.fileName || d.id.slice(0, 8)}</td>
                      <td className="px-md py-3"><Badge value={d.status || "unknown"} /></td>
                      <td className="mono-stat px-md py-3 text-[12px] text-on-surface-variant">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="mono-stat px-md py-3 text-[12px] text-on-surface-variant">{d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : "—"}</td>
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
    value === "verified" || value === "approved" ? "text-primary bg-secondary-container" :
    value === "rejected" || value === "expired" ? "text-error bg-error/10" :
    "bg-surface-container text-on-surface-variant";
  return <span className={"inline-flex rounded-full px-2 py-0.5 font-label-sm text-[11px] font-semibold " + tone}>{value}</span>;
}
