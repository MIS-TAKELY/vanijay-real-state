import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Management | Admin | Vanijay",
  description: "Manage content blocks, FAQs, and market commentary for precious metals pages.",
  robots: { index: false, follow: false },
};

export default function AdminContentPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-[#E8E6E1] mb-8" style={{ fontFamily: "var(--font-display)" }}>
        Content Management
      </h1>
      <p className="text-white/50 mb-8" style={{ fontFamily: "var(--font-body)" }}>
        Dummy CMS interface for managing metal page content blocks, FAQs, and market commentary.
      </p>
      <div className="rounded-xl border border-white/[0.06] bg-[#1A1D23] p-8 text-center">
        <p className="text-white/40 text-sm">Admin CMS coming soon. Content is currently managed via constants files.</p>
      </div>
    </div>
  );
}
