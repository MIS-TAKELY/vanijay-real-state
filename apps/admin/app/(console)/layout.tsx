import type { CSSProperties, ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
} from "@repo/ui";

import { OperationsSidebar } from "components/OperationsSidebar";
import { OperationsTopbar } from "components/OperationsTopbar";

export default function ConsoleLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <SidebarProvider
      className="h-svh overflow-hidden"
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        } as CSSProperties
      }
    >
      <OperationsSidebar />
      <SidebarInset className="min-w-0 overflow-hidden bg-admin-bg">
        <OperationsTopbar />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-container-max px-gutter py-md">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
