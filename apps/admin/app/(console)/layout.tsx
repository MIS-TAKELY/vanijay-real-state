import { OperationsSidebar } from "components/OperationsSidebar";
import { OperationsTopbar } from "components/OperationsTopbar";

export default function ConsoleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      <OperationsSidebar />
      <div className="flex-1 overflow-x-hidden">
        <OperationsTopbar />
        <main className="overflow-y-auto">
          <div className="max-w-container-max mx-auto px-gutter py-md">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
