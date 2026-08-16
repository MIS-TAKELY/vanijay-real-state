"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Button,
  ChevronLeft,
  Label,
  Loader2,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  cn,
} from "@repo/ui";
import {
  ListingWizard,
  listingDraftFromApiProperty,
  type ListingDraft,
} from "@repo/ui";
import { PageHeader } from "components/ui/PageHeader";
import {
  adminDeleteUpload,
  adminProperty,
  adminUpdateProperty,
  adminUploadFile,
  adminUploadFiles,
  type AdminPropertyDetail,
  type AdminPropertyPatch,
} from "lib/api";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "UNDER_VERIFICATION", label: "Under Verification" },
  { value: "LIVE", label: "Live" },
  { value: "SOLD", label: "Sold" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ARCHIVED", label: "Archived" },
];

const STATUS_DOT: Record<string, string> = {
  LIVE: "bg-primary",
  UNDER_VERIFICATION: "bg-tertiary",
  DRAFT: "bg-on-surface-variant/60",
  SOLD: "bg-secondary",
  REJECTED: "bg-error",
  ARCHIVED: "bg-on-surface-variant/30",
};

interface ModerationState {
  status: string;
  isFeatured: boolean;
  adminNote: string;
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-xs", className)}>
      <Label className="font-label-sm text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
        {label}
      </Label>
      {children}
      {hint ? (
        <p className="font-label-sm text-[11px] text-on-surface-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Admin-only controls rendered inside the shared wizard, above the footer. */
function ModerationCard({
  value,
  onChange,
}: {
  value: ModerationState;
  onChange: (next: ModerationState) => void;
}) {
  return (
    <div className="mt-md flex flex-col gap-md rounded-2xl border border-outline-variant bg-surface p-md">
      <div>
        <h3 className="font-headline-md text-base font-semibold text-on-surface">
          Moderation
        </h3>
        <p className="text-[12px] text-on-surface-variant">
          Status, visibility and the internal note — saved together with the
          content below.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Field label="Status">
          <Select
            value={value.status}
            onValueChange={(v) => onChange({ ...value, status: v })}
          >
            <SelectTrigger className="h-11 bg-surface">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        STATUS_DOT[opt.value],
                      )}
                    />
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-center gap-sm pt-md">
          <Switch
            id="mod-featured"
            checked={value.isFeatured}
            onCheckedChange={(v) => onChange({ ...value, isFeatured: v })}
          />
          <Label htmlFor="mod-featured">Featured on homepage</Label>
        </div>
      </div>
      <Field
        label="Admin note"
        hint="Visible only to the admin and verification teams."
      >
        <Textarea
          rows={3}
          value={value.adminNote}
          onChange={(e) => onChange({ ...value, adminNote: e.target.value })}
          className="bg-surface"
        />
      </Field>
    </div>
  );
}

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [property, setProperty] = useState<AdminPropertyDetail | null>(null);
  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [moderation, setModeration] = useState<ModerationState>({
    status: "DRAFT",
    isFeatured: false,
    adminNote: "",
  });

  useEffect(() => {
    let cancelled = false;
    adminProperty(id)
      .then((p) => {
        if (cancelled) return;
        setProperty(p);
        setDraft(listingDraftFromApiProperty(p));
        setModeration({
          status: p.status,
          isFeatured: p.isFeatured,
          adminNote: p.adminNote ?? "",
        });
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mt-lg flex items-center gap-xs text-on-surface-variant">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span>Loading listing…</span>
      </div>
    );
  }

  if (notFound || !property || !draft) {
    return (
      <div className="admin-surface mt-lg border border-outline-variant rounded-xl p-md">
        <p className="text-on-surface">Property not found.</p>
        <p className="mt-xs text-on-surface-variant">
          It may have been deleted, or the link is incorrect.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-md">
          <Link href="/listings">Back to listings</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        icon="edit"
        title={`Edit · ${property.listingCode}`}
        description={property.title}
      />

      <div className="mt-sm flex flex-wrap items-center gap-sm">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 text-on-surface-variant"
        >
          <Link href="/listings">
            <ChevronLeft className="size-4" aria-hidden="true" />
            Back to listings
          </Link>
        </Button>
        <Badge
          variant="outline"
          className="bg-surface-container text-on-surface-variant font-label-sm text-[11px] font-semibold"
        >
          {property.status.replaceAll("_", " ")}
        </Badge>
        <span className="font-label-sm text-[11px] text-on-surface-variant">
          Verification: {property.verificationLevel.replaceAll("_", " ")}
        </span>
        {property.owner ? (
          <span className="font-label-sm text-[11px] text-on-surface-variant">
            Owner: {property.owner.name || property.owner.email}
          </span>
        ) : null}
      </div>

      <section className="mt-lg">
        <ListingWizard
          initialDraft={draft}
          submitLabel="Save changes"
          successMode="edit"
          successHref="/listings"
          successHrefLabel="Back to listings"
          uploads={{
            uploadFile: adminUploadFile,
            uploadFiles: adminUploadFiles,
            deleteUpload: adminDeleteUpload,
          }}
          // footerExtra={
          //   <ModerationCard value={moderation} onChange={setModeration} />
          // }
          onSubmit={async (payload) => {
            const { documents: _documents, ...content } = payload;
            const patch: AdminPropertyPatch = {
              ...content,
              status: moderation.status,
              isFeatured: moderation.isFeatured,
              adminNote: moderation.adminNote.trim() || null,
            };
            const updated = await adminUpdateProperty(property.id, patch);
            router.refresh();
            return {
              id: updated.id,
              slug: updated.slug,
              title: updated.title,
              listingCode: updated.listingCode,
            };
          }}
        />
      </section>
    </>
  );
}
