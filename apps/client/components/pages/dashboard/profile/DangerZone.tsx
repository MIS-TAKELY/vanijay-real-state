"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, Button, Icon, Input, Label } from "@repo/ui";
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
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10 text-error">
                <Icon name="warning" filled className="text-[24px]" />
              </span>
              <AlertDialogTitle>Delete account?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              This is permanent and cannot be undone. All your listings,
              documents and favorites will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-xs">
            <Label>
              Type <span className="mono-stat font-bold">DELETE</span> to confirm
            </Label>
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="mono-stat h-11"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmText !== "DELETE"}
              onClick={() => setConfirmOpen(false)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Confirm delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
