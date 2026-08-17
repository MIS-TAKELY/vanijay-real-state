import { AuthGate } from "components/real-state/layout/AuthGate";
import { getSession } from "lib/auth-server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolve the session from the request cookie on the server so the HTML
  // already contains the real dashboard layout for signed-in users (no
  // skeleton flash) and matches what the client renders (no hydration
  // mismatch). AuthGate keeps the client-side session check + redirect.
  const session = await getSession();
  return <AuthGate initialUser={session?.user ?? null}>{children}</AuthGate>;
}
