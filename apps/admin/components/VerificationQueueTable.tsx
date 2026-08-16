"use client";

import {
  Badge,
  Button,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { VERIFICATION_QUEUE, type VerificationRow } from "constants/operations";
import { StatusChip, Stamp } from "components/StatusChip";

const HEADER_CLASS =
  "font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant";
const CELL_CLASS = "font-body-md text-body-md text-on-surface";

interface VerificationQueueTableProps {
  /** Rows to render. Defaults to the high-priority verification queue. */
  rows?: VerificationRow[];
}

export function VerificationQueueTable({
  rows = VERIFICATION_QUEUE,
}: VerificationQueueTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="border-b border-outline-variant/50">
            <TableHead className={HEADER_CLASS}>Plot code</TableHead>
            <TableHead className={HEADER_CLASS}>Listing</TableHead>
            <TableHead className={HEADER_CLASS}>District</TableHead>
            <TableHead className={HEADER_CLASS}>Price</TableHead>
            <TableHead className={HEADER_CLASS}>Level</TableHead>
            <TableHead className={HEADER_CLASS}>Status</TableHead>
            <TableHead className={HEADER_CLASS}>Pending</TableHead>
            <TableHead className={"text-right " + HEADER_CLASS}>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {VERIFICATION_QUEUE.map((row) => (
            <TableRow
              key={row.id}
              className="border-b border-outline-variant/40 hover:bg-surface-container"
            >
              <TableCell className="font-label-sm mono-stat text-[11px] font-bold text-primary">
                {row.code}
              </TableCell>
              <TableCell className={CELL_CLASS}>
                <div className="max-w-[220px] truncate" title={row.title}>
                  {row.title}
                </div>
              </TableCell>
              <TableCell className={CELL_CLASS}>{row.district}</TableCell>
              <TableCell className="mono-stat text-data-table font-medium text-on-surface">
                {row.price}
              </TableCell>
              <TableCell>
                <Stamp level={row.level} />
              </TableCell>
              <TableCell>
                <StatusChip status={row.status} />
              </TableCell>
              <TableCell>
                <span
                  className={
                    "mono-stat text-data-table font-medium " +
                    (row.daysPending > 3
                      ? "text-tertiary"
                      : "text-on-surface-variant")
                  }
                >
                  {row.daysPending}d
                </span>
                {row.daysPending > 3 ? (
                  <Badge
                    variant="default"
                    className="ml-xs mt-0.5 bg-tertiary/10 text-tertiary"
                  >
                    Overdue
                  </Badge>
                ) : null}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-sm text-primary hover:bg-surface-container hover:text-primary"
                >
                  <Icon name="visibility" /> Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
