import type { Metadata } from "next";

import "./globals.css";
import { Toaster } from "@repo/ui";

import { OperationsSidebar } from "components/OperationsSidebar";
import { OperationsTopbar } from "components/OperationsTopbar";

export const metadata: Metadata = {
  title: "Lekhaprati — Operations Console",
  description:
    "Archive control panel for verifying listings, managing documents, and resolving disputes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-admin-bg text-on-surface antialiased">
        <div className="flex min-h-screen">
          <OperationsSidebar />

          <div className="flex-1 overflow-x-hidden">
            <OperationsTopbar />
            <main className="overflow-y-auto">
              <div className="max-w-container-max mx-auto px-gutter py-md">
                {children}
              </div>
            </main>
          </div>
        </div>

        <Toaster />
      </body>
    </html>
  );
}
