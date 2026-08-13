"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Icon,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@repo/ui";
import { useState } from "react";
import { QUESTION_CATEGORY_LABELS, type QuestionCategory } from "./constants";

export function AskQuestionButton() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>(
    Object.keys(QUESTION_CATEGORY_LABELS)[0] ?? "",
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icon name="add" className="text-data-table" />
        Ask new question
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full sm:max-w-(--container-lg)">
          <DialogHeader>
            <DialogTitle>Ask the Archive</DialogTitle>
          </DialogHeader>

          <form
            className="flex w-full flex-col gap-md"
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
          >
            {/* Category select */}
            <div className="flex flex-col gap-xs">
              <Label htmlFor="q-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="q-category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(QUESTION_CATEGORY_LABELS) as QuestionCategory[]
                  ).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {QUESTION_CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Area tag */}
            <div className="flex flex-col gap-xs">
              <Label htmlFor="q-area">
                Area tag{" "}
                <span className="text-on-surface-variant">(optional)</span>
              </Label>
              <Input
                id="q-area"
                type="text"
                placeholder="e.g. Baluwatar"
                className="h-11 w-full"
              />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-xs">
              <Label htmlFor="q-body">Your question</Label>
              <Textarea
                id="q-body"
                rows={4}
                required
                className="w-full"
                placeholder="Be specific — mention the plot, the concern, and what you've already checked."
              />
            </div>

            <div className="flex flex-wrap justify-end gap-xs">
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
        </DialogContent>
      </Dialog>
    </>
  );
}
