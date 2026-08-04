"use client";

import { Button, Icon } from "@repo/ui";
import { useState } from "react";

export function DangerZone() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  return (
    <div className="rounded-2xl border border-error/40 bg-error/5 p-md">
      <h2 className="mb-md font-headline-md text-base font-semibold text-error">
        Danger Zone
      </h2>

      <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-on-surface">
            Export my data
          </span>
          <span className="text-[12px] text-on-surface-variant">
            Download a copy of your profile, listings and documents.
          </span>
        </div>
        <Button variant="outline">
          <Icon name="download" className="text-data-table" />
          Download
        </Button>
      </div>

      <div className="mt-md flex flex-col gap-md border-t border-error/20 pt-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-on-surface">
            Delete account
          </span>
          <span className="text-[12px] text-on-surface-variant">
            Permanently remove your account and all associated data.
          </span>
        </div>
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          <Icon name="delete_forever" className="text-data-table" />
          Delete account
        </Button>
      </div>

      {/* Typed-confirm dialog */}
      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-gutter"
          onClick={() => setConfirmOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm account deletion"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface border border-outline-variant shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-sm p-md">
              <div className="flex items-center gap-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10 text-error">
                  <Icon name="warning" filled className="text-[24px]" />
                </span>
                <h3 className="font-headline-md text-lg font-semibold text-on-surface">
                  Delete account?
                </h3>
              </div>
              <p className="text-sm text-on-surface-variant">
                This is permanent and cannot be undone. All your listings,
                documents and favorites will be removed.
              </p>
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                  Type <span className="mono-stat font-bold">DELETE</span> to
                  confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="mono-stat h-11 rounded-md border border-outline bg-surface px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-xs">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={confirmText !== "DELETE"}
                  onClick={() => setConfirmOpen(false)}
                >
                  Confirm delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
