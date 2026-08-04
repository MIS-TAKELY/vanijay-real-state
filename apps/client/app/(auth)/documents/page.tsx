import { Button, Icon } from "@repo/ui";
import { DashboardHeader } from "components/pages/dashboard";
import { DocumentVault } from "components/pages/dashboard/documents";

export default function DocumentVaultPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Document Vault"
        description="Your reusable verification documents — uploaded once, attached to any listing."
        action={
          <Button asChild>
            <a href="#">
              <Icon name="upload_file" className="text-data-table" />
              Upload Document
            </a>
          </Button>
        }
      />

      <DocumentVault />
    </div>
  );
}
