import type { VaultDocument } from "./constants";
import { DocumentCard } from "./DocumentCard";

interface DocumentGridProps {
  documents: VaultDocument[];
}

export function DocumentGrid({ documents }: DocumentGridProps) {
  return (
    <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
