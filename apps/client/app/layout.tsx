import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthModalListener } from "./components/auth/AuthModalListener";

export const metadata: Metadata = {
  title: "Lekhaprati | Verified Land & Property Archive",
  description:
    "The archive of record for legitimate land ownership in Nepal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-on-surface">
        {children}
        <Suspense fallback={null}>
          <AuthModalListener />
        </Suspense>
      </body>
    </html>
  );
}
