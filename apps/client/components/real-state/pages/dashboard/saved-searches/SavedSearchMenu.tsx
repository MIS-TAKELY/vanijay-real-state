"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Input,
  Label,
} from "@repo/ui";
import { useState } from "react";

interface SavedSearchMenuProps {
  label: string;
  busy?: boolean;
  onRename: (label: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function SavedSearchMenu({
  label,
  busy = false,
  onRename,
  onDuplicate,
  onDelete,
}: SavedSearchMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draftLabel, setDraftLabel] = useState(label);

  const openRename = () => {
    setDraftLabel(label);
    setRenameOpen(true);
  };

  const submitRename = () => {
    const next = draftLabel.trim();
    if (!next) return;
    onRename(next);
    setRenameOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Saved search actions"
            disabled={busy}
          >
            <Icon name="more_vert" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={openRename}>
              <Icon name="drive_file_rename_outline" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDuplicate}>
              <Icon name="content_copy" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeleteOpen(true)}
            >
              <Icon name="delete" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename search</DialogTitle>
            <DialogDescription>
              Give this saved search a name you will recognise later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="saved-search-name">Name</Label>
            <Input
              id="saved-search-name"
              type="text"
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitRename();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitRename}
              disabled={!draftLabel.trim()}
              className="bg-gold font-semibold text-on-gold hover:bg-gold/90"
            >
              Save name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10 text-error">
                <Icon name="delete" className="text-[24px]" />
              </span>
              <AlertDialogTitle>Delete this saved search?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              “{label}” will be removed and you will stop getting alerts for
              it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDeleteOpen(false);
                onDelete();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete search
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
