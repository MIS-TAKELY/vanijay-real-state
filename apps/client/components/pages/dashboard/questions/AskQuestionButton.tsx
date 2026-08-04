"use client";

import { Button, Icon } from "@repo/ui";
import { useEffect, useState } from "react";
import { QUESTION_CATEGORY_LABELS, type QuestionCategory } from "./constants";

export function AskQuestionButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icon name="add" className="text-data-table" />
        Ask new question
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-gutter"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Ask a new question"
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-surface border border-outline-variant shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant px-md py-sm">
              <h2 className="font-headline-md text-lg font-semibold text-on-surface">
                Ask the Archive
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            <form
              className="flex flex-col gap-md p-md"
              onSubmit={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
            >
              {/* Category select */}
              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="q-category"
                  className="font-label-sm text-label-sm font-semibold text-on-surface"
                >
                  Category
                </label>
                <select
                  id="q-category"
                  className="h-11 rounded-md border border-outline bg-surface px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                >
                  {(
                    Object.keys(QUESTION_CATEGORY_LABELS) as QuestionCategory[]
                  ).map((cat) => (
                    <option key={cat} value={cat}>
                      {QUESTION_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area tag */}
              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="q-area"
                  className="font-label-sm text-label-sm font-semibold text-on-surface"
                >
                  Area tag{" "}
                  <span className="text-on-surface-variant">(optional)</span>
                </label>
                <input
                  id="q-area"
                  type="text"
                  placeholder="e.g. Baluwatar"
                  className="h-11 rounded-md border border-outline bg-surface px-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>

              {/* Body */}
              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="q-body"
                  className="font-label-sm text-label-sm font-semibold text-on-surface"
                >
                  Your question
                </label>
                <textarea
                  id="q-body"
                  rows={4}
                  required
                  placeholder="Be specific — mention the plot, the concern, and what you've already checked."
                  className="w-full rounded-md border border-outline bg-surface px-3 py-2 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-xs">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Icon name="send" className="text-data-table" />
                  Post question
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
