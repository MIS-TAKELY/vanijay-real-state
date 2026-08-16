import type { ComponentProps, ReactNode } from "react";
import {
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";

export interface AdminColumn {
  label: ReactNode;
  /** Right-align numeric columns in both the header and cells. */
  align?: "left" | "right";
  className?: string;
}

export interface AdminDataTableProps {
  columns: (AdminColumn | string)[];
  /** Min width of the table in px — drives horizontal scrolling on narrow screens. */
  minWidth?: number;
  /** Show a centered "Loading…" row. */
  loading?: boolean;
  /** Dim + disable the rendered rows while refreshing in place (keeps data visible). */
  busy?: boolean;
  /** Show the centered empty-state row. */
  empty?: boolean;
  emptyMessage?: string;
  /** Extra classes for the outer surface wrapper. */
  className?: string;
  /** Row elements — use AdminDataTable.Row / AdminDataTable.Cell. */
  children?: ReactNode;
}

const HEADER_CLASS =
  "h-auto px-md py-3 font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant";

function DataRow({ className, ...props }: ComponentProps<typeof TableRow>) {
  return (
    <TableRow
      className={cn("hover:bg-surface-container/60", className)}
      {...props}
    />
  );
}

function DataCell({ className, ...props }: ComponentProps<typeof TableCell>) {
  return <TableCell className={cn("px-md py-3", className)} {...props} />;
}

/**
 * Shared chrome for admin tables: the admin-surface card, uppercase header row,
 * and consistent loading / empty / busy states. Rows are supplied as children
 * via AdminDataTable.Row / AdminDataTable.Cell.
 */
export const AdminDataTable = Object.assign(
  function AdminDataTable({
    columns,
    minWidth,
    loading = false,
    busy = false,
    empty = false,
    emptyMessage = "No rows found.",
    className,
    children,
  }: AdminDataTableProps) {
    const cols = columns.map((c) => (typeof c === "string" ? { label: c } : c));

    return (
      <div
        className={cn(
          "admin-surface border border-outline-variant rounded-xl overflow-hidden",
          className,
        )}
      >
        <Table style={minWidth ? { minWidth } : undefined}>
          <TableHeader className="border-b border-outline-variant bg-surface-container-low">
            <TableRow className="border-b border-outline-variant hover:bg-transparent">
              {cols.map((c, i) => (
                <TableHead
                  key={i}
                  className={cn(
                    HEADER_CLASS,
                    c.align === "right" && "text-right",
                    c.className,
                  )}
                >
                  {c.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody
            aria-busy={loading || busy}
            className={cn(
              "transition-opacity duration-200",
              busy && "pointer-events-none opacity-40",
            )}
          >
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="px-md py-lg text-center text-on-surface-variant"
                >
                  Loading…
                </TableCell>
              </TableRow>
            ) : empty ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="px-md py-lg text-center text-on-surface-variant"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              children
            )}
          </TableBody>
        </Table>
      </div>
    );
  },
  { Row: DataRow, Cell: DataCell },
);
