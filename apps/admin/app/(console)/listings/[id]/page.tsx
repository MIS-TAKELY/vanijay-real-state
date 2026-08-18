"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Button,
  ChevronLeft,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
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
  adminPropertyTransfers,
  adminTransferProperty,
  adminUpdateProperty,
  adminUploadFile,
  adminUploadFiles,
  adminUsers,
  type AdminPropertyDetail,
  type AdminPropertyPatch,
  type AdminUser,
  type TransferAuditRow,
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

  /* ── Transfer state ── */
  const [transferOpen, setTransferOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userSearching, setUserSearching] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");

  /* ── Transfer history ── */
  const [transferHistory, setTransferHistory] = useState<TransferAuditRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  /* ── User search for transfer ── */
  useEffect(() => {
    if (!transferOpen) return;
    if (userSearch.trim().length < 2) {
      setUserResults([]);
      return;
    }
    let cancelled = false;
    setUserSearching(true);
    const timer = setTimeout(() => {
      adminUsers(userSearch)
        .then((users) => {
          if (!cancelled) setUserResults(users);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setUserSearching(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [userSearch, transferOpen]);

  /* ── Load transfer history ── */
  const loadTransferHistory = (propertyId: string) => {
    setHistoryLoading(true);
    adminPropertyTransfers(propertyId)
      .then(setTransferHistory)
      .catch(() => setTransferHistory([]))
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => {
    if (property) loadTransferHistory(property.id);
  }, [property?.id]);

  const handleTransfer = async () => {
    if (!selectedUser || !property) return;
    setTransferring(true);
    setTransferError(null);
    setTransferSuccess(false);
    try {
      const updated = await adminTransferProperty(property.id, selectedUser.id);
      setProperty(updated);
      setTransferSuccess(true);
      setUserSearch("");
      setUserResults([]);
      setSelectedUser(null);
      setConfirmCode("");
      // Refresh transfer history
      loadTransferHistory(property.id);
      setTimeout(() => {
        setTransferOpen(false);
        setTransferSuccess(false);
      }, 1500);
    } catch (err: any) {
      setTransferError(err?.message || "Transfer failed. Please try again.");
    } finally {
      setTransferring(false);
    }
  };

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
        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-1.5 text-xs"
          onClick={() => setTransferOpen(true)}
        >
          <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
          Transfer
        </Button>
      </div>

      {/* ── Transfer Property Dialog ── */}
      <Dialog
        open={transferOpen}
        onOpenChange={(open) => {
          setTransferOpen(open);
          if (!open) {
            setUserSearch("");
            setUserResults([]);
          setSelectedUser(null);
          setTransferError(null);
          setTransferSuccess(false);
          setConfirmCode("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Property</DialogTitle>
            <DialogDescription>
              Transfer ownership of <strong>{property.listingCode}</strong> to
              another user. The new owner will receive full control of this
              listing.
            </DialogDescription>
          </DialogHeader>

          {property.owner && (
            <div className="rounded-lg border border-outline-variant bg-surface-container p-3">
              <p className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Current owner
              </p>
              <p className="mt-1 text-sm font-medium text-on-surface">
                {property.owner.name || property.owner.email}
              </p>
              <p className="text-xs text-on-surface-variant">
                {property.owner.email}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="transfer-user-search"
              className="font-label-sm text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              Search for new owner
            </Label>
            <Input
              id="transfer-user-search"
              placeholder="Type a name or email…"
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setSelectedUser(null);
              }}
            />
          </div>

          {/* Search results */}
          {userSearch.trim().length >= 2 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-outline-variant">
              {userSearching ? (
                <div className="flex items-center gap-2 p-3 text-sm text-on-surface-variant">
                  <Loader2 className="size-3 animate-spin" />
                  Searching…
                </div>
              ) : userResults.length === 0 ? (
                <p className="p-3 text-sm text-on-surface-variant">
                  No users found.
                </p>
              ) : (
                userResults.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(user);
                      setUserSearch(user.name || user.email);
                      setUserResults([]);
                    }}
                    className={cn(
                      "flex w-full flex-col gap-0.5 border-b border-outline-variant/40 p-3 text-left transition-colors last:border-b-0 hover:bg-surface-container",
                      selectedUser?.id === user.id && "bg-primary/5 ring-1 ring-primary/30",
                    )}
                  >
                    <span className="text-sm font-medium text-on-surface">
                      {user.name || "(no name)"}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {user.email}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Selected user chip */}
          {selectedUser && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2">
              <span className="size-6 flex items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {(selectedUser.name || selectedUser.email).charAt(0).toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-on-surface">
                  {selectedUser.name || "(no name)"}
                </p>
                <p className="truncate text-xs text-on-surface-variant">
                  {selectedUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded p-1 text-on-surface-variant hover:text-on-surface"
              >
                ✕
              </button>
            </div>
          )}

          {/* Confirmation step — type the listing code to proceed */}
          {selectedUser && !transferSuccess && (
            <div className="flex flex-col gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
              <Label
                htmlFor="transfer-confirm"
                className="font-label-sm text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                Confirm by typing the listing code
              </Label>
              <p className="text-xs text-on-surface-variant">
                Type <strong className="font-mono text-on-surface">{property.listingCode}</strong> to confirm this transfer.
              </p>
              <Input
                id="transfer-confirm"
                placeholder={property.listingCode}
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                className={cn(
                  "h-9 text-sm",
                  confirmCode && confirmCode !== property.listingCode && "border-error/50 focus-visible:ring-error/30",
                  confirmCode === property.listingCode && "border-primary/50 focus-visible:ring-primary/30",
                )}
              />
            </div>
          )}

          {transferError && (
            <p className="text-sm text-error">{transferError}</p>
          )}
          {transferSuccess && (
            <p className="text-sm text-primary font-medium">
              ✓ Property transferred successfully!
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="sm"
              disabled={!selectedUser || transferring || confirmCode !== property.listingCode}
              onClick={handleTransfer}
              className="gap-2"
            >
              {transferring && <Loader2 className="size-3 animate-spin" />}
              Transfer to {selectedUser?.name || "…"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* ── Transfer History ── */}
      {transferHistory.length > 0 && (
        <section className="mt-lg rounded-2xl border border-outline-variant bg-surface p-md">
          <h3 className="font-headline-md text-base font-semibold text-on-surface">
            Transfer History
          </h3>
          <p className="mt-1 text-xs text-on-surface-variant">
            Past ownership transfers for this property.
          </p>
          <div className="mt-4">
            {historyLoading ? (
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Loader2 className="size-3 animate-spin" />
                Loading history…
              </div>
            ) : (
              <div className="space-y-3">
                {transferHistory.map((entry) => {
                  
                  const date = new Date(entry.createdAt);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 rounded-lg border border-outline-variant/50 bg-surface-container p-3"
                    >
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-on-surface">
                          {entry.summary || "Ownership transferred"}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="text-xs text-on-surface-variant">
                            By {entry.actor.name || entry.actor.email}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            {date.toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
