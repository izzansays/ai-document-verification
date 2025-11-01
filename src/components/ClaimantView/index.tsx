import { FileText } from "lucide-react";
import { useState } from "react";
import { TitleBarStepper } from "@/components/stepper/title-bar";
import { ReviewDetailsStep } from "./ReviewDetailsStep";
import { SelectDocumentStep } from "./SelectDocumentStep";

type Document = {
  id: string;
  type: "medical_bill" | "vehicle_repair" | "police_report";
  name: string;
  url: string;
};

export function ClaimantView() {
  const [step, setStep] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  const handleDocumentPreview = (document: Document | null) => {
    setSelectedDocument(document);
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedDocument(null);
  };

  const steps = [
    {
      title: "Select Document",
      content: (
        <SelectDocumentStep
          onDocumentSelect={handleDocumentSelect}
          onDocumentPreview={handleDocumentPreview}
          selectedDocument={selectedDocument}
        />
      ),
    },
    {
      title: "Review Details",
      content: (
        <ReviewDetailsStep
          selectedDocument={selectedDocument}
          onBack={handleBack}
        />
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2">
      <TitleBarStepper
        steps={steps}
        currentStep={step}
        onStepChange={setStep}
        className="space-y-8 border-r p-4"
      />
      <div className="flex items-center justify-center bg-gray-50 p-8">
        {selectedDocument ? (
          <div className="w-full max-w-2xl">
            <div className="overflow-hidden bg-white shadow-lg">
              <img
                src={selectedDocument.url}
                alt={selectedDocument.name}
                className="h-auto w-full"
                width="800"
                height="1000"
              />
            </div>
          </div>
        ) : (
          <div className="grid place-items-center text-center text-gray-500">
            <FileText size={40} />
            <p className="text-lg">Select a document to view preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
