import { Button } from "@/components/ui/button";

type DocumentType = "medical_bill" | "vehicle_repair" | "police_report";

type Document = {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
};

const staticDocuments: Document[] = [
  {
    id: "medical-1",
    type: "medical_bill",
    name: "Medical Bill 1",
    url: "/documents/medical.webp",
  },
  {
    id: "medical-2",
    type: "medical_bill",
    name: "Medical Bill 2",
    url: "/documents/medical2.webp",
  },
  {
    id: "medical-3",
    type: "medical_bill",
    name: "Medical Bill 3",
    url: "/documents/medical3.webp",
  },
  {
    id: "repair-1",
    type: "vehicle_repair",
    name: "Vehicle Repair 1",
    url: "/documents/repair.webp",
  },
  {
    id: "repair-2",
    type: "vehicle_repair",
    name: "Vehicle Repair 2",
    url: "/documents/repair2.webp",
  },
  {
    id: "repair-3",
    type: "vehicle_repair",
    name: "Vehicle Repair 3",
    url: "/documents/repair3.webp",
  },
  {
    id: "police-1",
    type: "police_report",
    name: "Police Report 1",
    url: "/documents/police.webp",
  },
  {
    id: "police-2",
    type: "police_report",
    name: "Police Report 2",
    url: "/documents/police2.webp",
  },
  {
    id: "police-3",
    type: "police_report",
    name: "Police Report 3",
    url: "/documents/police3.webp",
  },
];

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
  const handleDocumentClick = (doc: Document) => {
    onDocumentPreview?.(doc);
  };

  const handleContinue = () => {
    if (selectedDocument) {
      onDocumentSelect(selectedDocument);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <p className="mb-8 text-gray-600">
        Select a document to begin your claim submission
      </p>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {staticDocuments.map((doc) => (
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
                src={doc.url}
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
