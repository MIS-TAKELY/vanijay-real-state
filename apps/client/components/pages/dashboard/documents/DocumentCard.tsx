import { Badge, Icon } from "@repo/ui";
import type { VaultDocument } from "./constants";
import { DocumentMenu } from "./DocumentMenu";
import { DocumentStatusChip } from "./DocumentStatusChip";
import { DocumentTypeIcon } from "./DocumentTypeIcon";
import { ExpiryChip } from "./ExpiryChip";

interface DocumentCardProps {
  document: VaultDocument;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const typeLabel =
    document.type === "CITIZENSHIP_FRONT" ||
    document.type === "CITIZENSHIP_BACK"
      ? "Citizenship"
      : document.type
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="group flex flex-col gap-sm rounded-2xl border border-outline-variant bg-surface p-md transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      {/* Top row: icon + name + menu */}
      <div className="flex items-start gap-sm">
        <DocumentTypeIcon type={document.type} />
        <div className="flex min-w-0 flex-1 flex-col">
          <h3
            className="truncate text-sm font-medium text-on-surface"
            title={document.fileName}
          >
            {document.fileName}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded bg-surface-container px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
              {typeLabel}
            </span>
            <DocumentStatusChip status={document.status} />
          </div>
        </div>
        <DocumentMenu />
      </div>

      {/* Meta + expiry */}
      <div className="flex flex-col gap-1 border-t border-outline-variant pt-sm">
        <div className="flex items-center justify-between">
          <span className="mono-stat text-[12px] text-on-surface-variant">
            {document.fileSizeMb.toFixed(1)} MB
          </span>
          <span className="mono-stat text-[12px] text-on-surface-variant">
            {document.uploadedAt}
          </span>
        </div>
        <ExpiryChip daysUntilExpiry={document.daysUntilExpiry} />
      </div>

      {/* Footer: linked listings */}
      <div className="flex items-center justify-between">
        {document.linkedListings > 0 ? (
          <Badge variant="secondary" className="gap-1">
            <Icon name="link" className="text-[12px]" />
            {document.linkedListings} listing
            {document.linkedListings > 1 ? "s" : ""}
          </Badge>
        ) : (
          <span className="text-[11px] text-on-surface-variant">
            Not attached to any listing
          </span>
        )}
      </div>
    </div>
  );
}
