import { cookies } from "next/headers";
import { PageHeader } from "components/ui/PageHeader";
import { AdminProperty } from "lib/api";
import { adminFetch } from "lib/server";

export const dynamic = "force-dynamic";

export default async function VerificationsPage() {
  const cookie = (await cookies()).toString();
  let rows: AdminProperty[] = [];
  try {
    rows = await adminFetch<AdminProperty[]>(cookie, "/api/v1/admin/verification-queue");
  } catch {
    rows = [];
  }

  return (
    <>
      <PageHeader
        icon="verified"
        title="Verification Queue"
        description={`${rows.length} listings awaiting document and ownership verification.`}
      />
      <section className="mt-lg">
        <div className="admin-surface border border-outline-variant rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-outline-variant bg-surface-container-low font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
                <tr>
                  <th className="px-md py-3">Code</th>
                  <th className="px-md py-3">Title</th>
                  <th className="px-md py-3">Type</th>
                  <th className="px-md py-3">Price</th>
                  <th className="px-md py-3">Owner</th>
                  <th className="px-md py-3">Location</th>
                  <th className="px-md py-3">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {rows.length === 0 ? (
                  <tr><td colSpan={7} className="px-md py-lg text-center text-on-surface-variant">No listings in the verification queue.</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-container/60">
                      <td className="mono-stat px-md py-3 text-[12px] text-on-surface-variant">{r.listingCode}</td>
                      <td className="px-md py-3 font-medium text-on-surface">{r.title}</td>
                      <td className="px-md py-3 text-on-surface-variant">{r.propertyType}</td>
                      <td className="mono-stat px-md py-3 text-on-surface">{r.askingPrice}</td>
                      <td className="px-md py-3 text-on-surface-variant">{r.owner?.name || "—"}</td>
                      <td className="px-md py-3 text-on-surface-variant">{[r.location?.district, r.location?.municipality].filter(Boolean).join(", ") || "—"}</td>
                      <td className="mono-stat px-md py-3 text-[12px] text-on-surface-variant">{new Date(r.createdAt).toLocaleDateString()}</td>
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
