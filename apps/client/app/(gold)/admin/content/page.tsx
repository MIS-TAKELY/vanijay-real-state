import type { Metadata } from "next";
import { ContentAdmin } from "components/admin/ContentAdmin";

export const metadata: Metadata = {
  title: "Content Management | Admin | Malpoth",
  description:
    "Manage hero banner slides, category tiles, and metals content blocks displayed across the client.",
  robots: { index: false, follow: false },
};

export default function AdminContentPage() {
  return <ContentAdmin />;
}
