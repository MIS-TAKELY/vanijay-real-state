"use client";

import { Button } from "@repo/ui";
import { useMemo, useState } from "react";
import { EmptyState } from "../../../common/dashboard/EmptyState";
import {
  DOC_FILTER_TABS,
  EXPIRY_SOON_DAYS,
  VAULT_DOCUMENTS,
  type DocumentFilter,
  type VaultDocument,
} from "./constants";
import { DocumentExplainer } from "./DocumentExplainer";
import { DocumentFilterTabs } from "./DocumentFilterTabs";
import { DocumentGrid } from "./DocumentGrid";
import Link from "next/link";

function isExpiring(doc: VaultDocument): boolean {
  return (
    doc.daysUntilExpiry !== null &&
    doc.daysUntilExpiry >= 0 &&
    doc.daysUntilExpiry <= EXPIRY_SOON_DAYS
  );
}

function isExpired(doc: VaultDocument): boolean {
  return (
    doc.status === "EXPIRED" ||
    (doc.daysUntilExpiry !== null && doc.daysUntilExpiry < 0)
  );
}

export function DocumentVault() {
  const [active, setActive] = useState<DocumentFilter>("ALL");

  const counts = useMemo(() => {
    const next = {} as Record<DocumentFilter, number>;
    for (const tab of DOC_FILTER_TABS) {
      next[tab.key] =
        tab.key === "ALL"
          ? VAULT_DOCUMENTS.length
          : tab.key === "VERIFIED"
            ? VAULT_DOCUMENTS.filter((d) => d.status === "VERIFIED").length
            : tab.key === "PENDING"
              ? VAULT_DOCUMENTS.filter((d) => d.status === "PENDING").length
              : tab.key === "EXPIRING"
                ? VAULT_DOCUMENTS.filter((d) => isExpiring(d)).length
                : VAULT_DOCUMENTS.filter((d) => isExpired(d)).length;
    }
    return next;
  }, []);

  const filtered = useMemo(() => {
    switch (active) {
      case "VERIFIED":
        return VAULT_DOCUMENTS.filter((d) => d.status === "VERIFIED");
      case "PENDING":
        return VAULT_DOCUMENTS.filter((d) => d.status === "PENDING");
      case "EXPIRING":
        return VAULT_DOCUMENTS.filter((d) => isExpiring(d));
      case "EXPIRED":
        return VAULT_DOCUMENTS.filter((d) => isExpired(d));
      default:
        return VAULT_DOCUMENTS;
    }
  }, [active]);

  if (VAULT_DOCUMENTS.length === 0) {
    return (
      <EmptyState
        icon="folder_open"
        title="Your vault is empty"
        description="Upload your Lalpurja, citizenship or tax clearance to reuse them across listings."
        action={
          <Button asChild>
            <Link href="#">
              Upload your first document
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col">
      <DocumentExplainer />

      <DocumentFilterTabs
        active={active}
        counts={counts}
        onChange={setActive}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon="filter_list_off"
          title="No documents match this filter"
          description="Try a different tab to see your vault documents."
        />
      ) : (
        <DocumentGrid documents={filtered} />
      )}
    </div>
  );
}
