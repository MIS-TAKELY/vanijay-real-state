"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/Icon";
import type { StepProps } from "./types";

function Section({
  title,
  hint,
  children,
}: {
  title?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-sm">
      {title && (
        <div className="flex flex-col gap-0.5">
          <h3 className="font-label-sm text-sm font-semibold text-on-surface">
            {title}
          </h3>
          {hint && (
            <p className="text-[11px] leading-4 text-on-surface-variant">
              {hint}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/** Strip Markdown bold/italic markers (**text**, __text__). */
function stripMd(s: string): string {
  return s.replace(/\*{1,3}|_{1,3}/g, "").trim();
}

/**
 * Parse pasted table text into [detail, value] rows.
 * Supports:
 *  - Tab-separated (Excel / Google Sheets)
 *  - Markdown pipe tables (| Detail | Value |)
 */
function parsePastedTable(text: string): [string, string][] {
  const rawLines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!rawLines.length) return [];

  // Detect Markdown table: lines contain at least two pipes
  const isMarkdown = rawLines.some(
    (l) => (l.match(/\|/g) || []).length >= 2,
  );

  if (isMarkdown) {
    return rawLines
      .filter((l) => !/^\s*\|?[\s\-:|]+\|?\s*$/.test(l)) // skip separator rows
      .map((line) => {
        const cells = line
          .split("|")
          .map((c) => stripMd(c))
          .filter((_, i, arr) => i > 0 && i < arr.length - (line.trimEnd().endsWith("|") ? 1 : 0));
        return [
          cells[0]?.trim() ?? "",
          cells[1]?.trim() ?? "",
        ] as [string, string];
      })
      .filter(([a, b]) => a || b);
  }

  // Tab-separated fallback
  return rawLines.map((line) => {
    const cols = line.split("\t");
    return [cols[0]?.trim() ?? "", cols[1]?.trim() ?? ""] as [string, string];
  });
}

export function CustomSpecsBlock({ draft, update }: StepProps) {
  const specs = draft.customSpecs ?? [];

  const addTable = () =>
    update({ customSpecs: [...specs, { heading: "", rows: [["", ""]] }] });

  const removeTable = (idx: number) =>
    update({ customSpecs: specs.filter((_, i) => i !== idx) });

  const updateHeading = (idx: number, heading: string) =>
    update({
      customSpecs: specs.map((s, i) =>
        i === idx ? { ...s, heading } : s,
      ),
    });

  const updateRow = (
    tIdx: number,
    rIdx: number,
    col: 0 | 1,
    val: string,
  ) =>
    update({
      customSpecs: specs.map((s, i) => {
        if (i !== tIdx) return s;
        const rows = s.rows.map((r, ri) =>
          ri === rIdx
            ? ([col === 0 ? val : r[0], col === 1 ? val : r[1]] as [
                string,
                string,
              ])
            : r,
        );
        return { ...s, rows };
      }),
    });

  const addRow = (tIdx: number) =>
    update({
      customSpecs: specs.map((s, i) =>
        i === tIdx ? { ...s, rows: [...s.rows, ["", ""]] } : s,
      ),
    });

  const removeRow = (tIdx: number, rIdx: number) =>
    update({
      customSpecs: specs.map((s, i) => {
        if (i !== tIdx) return s;
        const rows = s.rows.filter((_, ri) => ri !== rIdx);
        return { ...s, rows: rows.length ? rows : [["", ""]] };
      }),
    });

  const handlePaste = (e: React.ClipboardEvent, tIdx: number) => {
    const text = e.clipboardData.getData("text/plain");
    const parsed = parsePastedTable(text);
    if (!parsed.length) return;
    e.preventDefault();
    update({
      customSpecs: specs.map((s, i) =>
        i === tIdx ? { ...s, rows: parsed } : s,
      ),
    });
  };

  return (
    <Section
      title="Additional Specifications"
      hint="Add custom tables with your own headings. Paste directly from Excel or Google Sheets."
    >
      <div className="flex flex-col gap-md">
        {specs.map((table, tIdx) => (
          <div
            key={tIdx}
            className="rounded-xl border border-outline-variant bg-surface p-3 sm:p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <Input
                placeholder="Table heading (e.g. Interior Details)"
                value={table.heading}
                onChange={(e) => updateHeading(tIdx, e.target.value)}
                className="flex-1 font-semibold text-sm sm:text-base"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTable(tIdx)}
                className="shrink-0 text-on-surface-variant hover:text-error"
                aria-label="Remove table"
              >
                <Icon name="delete" className="text-[18px]" />
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {table.rows.map((row, rIdx) => (
                <div
                  key={rIdx}
                  className="flex min-w-0 items-center gap-1.5 sm:gap-2"
                >
                  <Input
                    placeholder="Detail"
                    value={row[0]}
                    onChange={(e) =>
                      updateRow(tIdx, rIdx, 0, e.target.value)
                    }
                    onPaste={(e) => handlePaste(e, tIdx)}
                    className="h-9 min-w-0 flex-1 text-xs sm:text-sm"
                  />
                  <Input
                    placeholder="Value"
                    value={row[1]}
                    onChange={(e) =>
                      updateRow(tIdx, rIdx, 1, e.target.value)
                    }
                    onPaste={(e) => handlePaste(e, tIdx)}
                    className="h-9 min-w-0 flex-1 text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(tIdx, rIdx)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded p-1 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
                    aria-label="Remove row"
                  >
                    <Icon name="close" className="text-[16px]" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addRow(tIdx)}
                className="shrink-0"
              >
                <Icon name="add" className="text-[16px]" />
                Add row
              </Button>
              <span className="text-[11px] text-on-surface-variant leading-tight">
                Paste a table from Excel / Sheets into any Detail cell to bulk-add rows
              </span>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTable}
          className="w-fit"
        >
          <Icon name="add" className="text-[16px]" />
          Add another table
        </Button>
      </div>
    </Section>
  );
}
