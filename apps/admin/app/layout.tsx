import type { Metadata } from "next";

import "./globals.css";
import { Toaster } from "@repo/ui";

export const metadata: Metadata = {
  title: "Lekhaprati — Admin",
  description:
    "Archive control panel for verifying listings, managing documents, resolving disputes, curating CMS content, gold prices and kabadi rates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-admin-bg text-on-surface antialiased">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}

