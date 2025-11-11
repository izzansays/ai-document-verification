import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TitleBarStepper } from "@/components/stepper/title-bar";
import { useNavigation } from "@/stores/claimantStore";
import { ClaimantDetails } from "./ClaimantDetails";
import { ReviewDetailsStep } from "./ReviewDetailsStep";
import { SelectDocumentStep } from "./SelectDocumentStep";

export function ClaimantView() {
  const { step, selectedDocument } = useNavigation();

  // Show landing page when step is 0
  if (step === 0) {
    return <ClaimantDetails />;
  }

  // Show stepper when in claim process (step 1 or 2)
  const steps = [
    {
      title: "Select Document",
      content: <SelectDocumentStep />,
    },
    {
      title: "Review Details",
      content: <ReviewDetailsStep />,
    },
  ];

  return (
    <div className="grid h-full grid-cols-2">
      <TitleBarStepper
        steps={steps}
        currentStep={step}
        className="space-y-8 border-r p-4"
      />
      <ScrollArea className="bg-gray-50">
        <div className="flex min-h-full items-center justify-center p-8">
          {selectedDocument ? (
            <div className="w-full max-w-2xl">
              <div className="overflow-hidden bg-white shadow-lg">
                <img
                  src={selectedDocument.url ?? undefined}
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
