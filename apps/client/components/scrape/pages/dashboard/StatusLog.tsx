"use client";

import { Terminal } from "lucide-react";
import { useEffect, useRef } from "react";

export type LogTone = "muted" | "info" | "ok" | "warn";

export interface LogLine {
  time: string;
  text: string;
  tone: LogTone;
}

const TONE_CLASS: Record<LogTone, string> = {
  muted: "text-scrape-muted",
  info: "text-scrape-primary",
  ok: "text-scrape-success",
  warn: "text-scrape-warning",
};

const PREFIX: Record<LogTone, string> = {
  muted: "·",
  info: "›",
  ok: "✓",
  warn: "!",
};

export function StatusLog({ lines, running }: { lines: LogLine[]; running: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lines.length]);

  return (
    <div className="overflow-hidden rounded-xl border border-scrape-border bg-[#0b0e13]">
      <div className="flex items-center justify-between border-b border-scrape-border bg-scrape-surface px-4 py-2.5">
        <span className="flex items-center gap-2 font-scrape-mono text-xs text-scrape-muted">
          <Terminal className="h-3.5 w-3.5" />
          scrape.log
        </span>
        {running && (
          <span className="flex items-center gap-1.5 font-scrape-mono text-[11px] text-scrape-warning">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-scrape-warning" />
            running
          </span>
        )}
      </div>
      <div className="max-h-44 space-y-1.5 overflow-y-auto p-4 font-scrape-mono text-xs leading-relaxed">
        {lines.length === 0 && !running && (
          <p className="text-scrape-muted">
            · idle — configure the source and hit “Run scrape”
          </p>
        )}
        {lines.map((line, i) => (
          <p key={i} className="flex gap-2">
            <span className="shrink-0 text-scrape-muted">[{line.time}]</span>
            <span className={`${PREFIX[line.tone]} ${TONE_CLASS[line.tone]}`}>
              {line.text}
            </span>
          </p>
        ))}
        {running && (
          <p className="flex gap-2">
            <span className="shrink-0 text-scrape-muted">[••]</span>
            <span className="text-scrape-primary">
              working
              <span className="scrape-caret ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-scrape-primary" />
            </span>
          </p>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
