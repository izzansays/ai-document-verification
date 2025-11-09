import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type DocumentType = "medical_bill" | "vehicle_repair" | "police_report";

type Document = {
  id: Id<"documents">;
  type: DocumentType;
  name: string;
  storageId: Id<"_storage">;
  url: string | null;
};

type SelectDocumentStepProps = {
  onDocumentSelect: (document: Document) => void;
  onDocumentPreview?: (document: Document | null) => void;
  selectedDocument: Document | null;
};

export function SelectDocumentStep({
  onDocumentSelect,
  onDocumentPreview,
  selectedDocument,
}: SelectDocumentStepProps) {
  const documents = useQuery(api.documents.listDocuments);

  const handleDocumentClick = (doc: Document) => {
    onDocumentPreview?.(doc);
  };

  const handleContinue = () => {
    if (selectedDocument) {
      onDocumentSelect(selectedDocument);
    }
  };

  if (!documents) {
    return <div className="text-center text-gray-600">Loading documents...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <p className="mb-8 text-gray-600">
        Select a document to begin your claim submission
      </p>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {documents.map((doc) => (
          <button
            type="button"
            key={doc.id}
            className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
              selectedDocument?.id === doc.id
                ? "border-blue-600 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-blue-400 hover:shadow-lg"
            }`}
            onClick={() => handleDocumentClick(doc)}
          >
            <div className="mb-2">
              <img
                src={doc.url ?? undefined}
                alt={doc.name}
                className="h-32 w-full rounded border object-cover"
                width="300"
                height="128"
              />
            </div>
            <h3 className="text-center font-semibold text-sm">{doc.name}</h3>
          </button>
        ))}
      </div>

      <div className="mb-8 flex justify-end">
        <Button onClick={handleContinue} disabled={!selectedDocument} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
