"use client";

import { useId, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Switch,
  Textarea,
} from "@repo/ui";
import type { CmsContentItem } from "lib/api";

export interface FaqFormValues {
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
}

interface FaqFormDialogProps {
  open: boolean;
  item: CmsContentItem | null;
  nextSortOrder: number;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: FaqFormValues) => Promise<void> | void;
}

/** Fields initialize from `item` at mount — the parent remounts this dialog
 *  per open (via React `key`) to reset the form. */
export function FaqFormDialog({
  open,
  item,
  nextSortOrder,
  saving,
  onOpenChange,
  onSave,
}: FaqFormDialogProps) {
  const formId = useId();
  const [question, setQuestion] = useState(item?.title ?? "");
  const [answer, setAnswer] = useState(item?.body ?? "");
  const [sortOrder, setSortOrder] = useState(item?.sortOrder ?? nextSortOrder);
  const [published, setPublished] = useState(item?.published ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!question.trim()) next.question = "Enter the question.";
    if (!answer.trim()) next.answer = "Enter the answer.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSave({
      question: question.trim(),
      answer: answer.trim(),
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      published,
    });
  }

  const isEdit = Boolean(item);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          <DialogDescription>
            Questions published here appear in the landing page FAQ section.
          </DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
          {Object.keys(errors).length > 0 ? (
            <div
              role="alert"
              tabIndex={-1}
              className="rounded-md border border-error/40 bg-error/5 px-3 py-2 text-sm text-error"
            >
              Fix the highlighted fields before saving.
            </div>
          ) : null}
          <div>
            <Label htmlFor="faq-question">Question *</Label>
            <Input
              id="faq-question"
              placeholder="e.g. Can foreigners buy land in Nepal?"
              value={question}
              aria-invalid={Boolean(errors.question)}
              aria-describedby={errors.question ? "faq-question-error" : undefined}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-surface"
            />
            {errors.question ? (
              <p id="faq-question-error" className="mt-1 text-xs text-error">
                {errors.question}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="faq-answer">Answer *</Label>
            <Textarea
              id="faq-answer"
              rows={6}
              placeholder="Write a clear, helpful answer…"
              value={answer}
              aria-invalid={Boolean(errors.answer)}
              aria-describedby={errors.answer ? "faq-answer-error" : undefined}
              onChange={(e) => setAnswer(e.target.value)}
              className="bg-surface"
            />
            {errors.answer ? (
              <p id="faq-answer-error" className="mt-1 text-xs text-error">
                {errors.answer}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-end gap-6">
            <div className="w-32">
              <Label htmlFor="faq-order">Sort Order *</Label>
              <Input
                id="faq-order"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="bg-surface"
              />
            </div>
            <div className="flex items-center gap-3 pb-1">
              <Switch
                id="faq-active"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="faq-active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="border-outline-variant"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={saving}
            className="bg-on-surface text-surface hover:bg-on-surface/90"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
