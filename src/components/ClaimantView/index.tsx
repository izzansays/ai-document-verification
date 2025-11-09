import { FileText } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TitleBarStepper } from "@/components/stepper/title-bar";
import { ClaimantDetails } from "./ClaimantDetails";
import { ReviewDetailsStep } from "./ReviewDetailsStep";
import { SelectDocumentStep } from "./SelectDocumentStep";

type Document = {
  id: string;
  type: "medical_bill" | "vehicle_repair" | "police_report";
  name: string;
  url: string;
};

export function ClaimantView() {
  const [inClaimProcess, setInClaimProcess] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  const handleStartClaim = () => {
    setInClaimProcess(true);
    setStep(1);
  };

  const handleDocumentPreview = (document: Document | null) => {
    setSelectedDocument(document);
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setStep(2);
  };

  const handleBackToDocumentSelect = () => {
    setStep(1);
    setSelectedDocument(null);
  };

  const handleCompleteAndReturn = () => {
    setInClaimProcess(false);
    setStep(1);
    setSelectedDocument(null);
  };

  // Show landing page when not in claim process
  if (!inClaimProcess) {
    return <ClaimantDetails onStartClaim={handleStartClaim} />;
  }

  // Show stepper when in claim process
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
          onBack={handleBackToDocumentSelect}
          onComplete={handleCompleteAndReturn}
        />
      ),
    },
  ];

  return (
    <div className="grid h-full grid-cols-2">
      <TitleBarStepper
        steps={steps}
        currentStep={step}
        onStepChange={setStep}
        className="space-y-8 border-r p-4"
      />
      <ScrollArea className="bg-gray-50">
        <div className="flex min-h-full items-center justify-center p-8">
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
      </ScrollArea>
    </div>
  );
}
