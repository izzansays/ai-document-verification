import { useAction, useMutation, useQuery } from "convex/react";
import { CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/UserContext";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Sparkles } from "../animate-ui/icons/sparkles";

type ExtractedDetails = {
  amount: number;
  date: string;
  parties: string[];
  description: string;
};

type Document = {
  id: string;
  type: "medical_bill" | "vehicle_repair" | "police_report";
  name: string;
  storageId: Id<"_storage">;
  url: string | null;
};

type ReviewDetailsStepProps = {
  selectedDocument: Document | null;
  onBack: () => void;
  onComplete?: () => void;
};

type FormState = "extracting" | "editing" | "submitting" | "submitted";

export function ReviewDetailsStep({
  selectedDocument,
  onBack,
  onComplete,
}: ReviewDetailsStepProps) {
  const { email } = useUser();
  const [editableDetails, setEditableDetails] =
    useState<ExtractedDetails | null>(null);
  const [formState, setFormState] = useState<FormState>("extracting");
  const [claimId, setClaimId] = useState<string | undefined>(undefined);

  const extractDetails = useAction(api.ai.extractDocumentDetails);
  const evaluateClaim = useAction(api.ai.evaluateClaim);
  const submitClaim = useMutation(api.claims.submitClaim);
  const policyRules = useQuery(api.claims.getPolicyRules);

  let hasExtracted = false;

  // Extract details when document is selected (only once)
  useEffect(() => {
    if (!selectedDocument || hasExtracted) {
      return;
    }

    hasExtracted = true;
    const extract = async () => {
      setFormState("extracting");
      try {
        const details = await extractDetails({
          documentType: selectedDocument.type,
          storageId: selectedDocument.storageId,
        });
        setEditableDetails(details);
        setFormState("editing");
      } catch (_error) {
        toast.error("Failed to extract document details");
        setFormState("editing");
      }
    };

    extract();
  }, [selectedDocument, hasExtracted, extractDetails]);

  const handleSubmit = async () => {
    if (!(selectedDocument && editableDetails && email && policyRules)) {
      return;
    }

    try {
      setFormState("submitting");

      // First, evaluate the claim using AI
      const aiEvaluation = await evaluateClaim({
        extractedDetails: editableDetails,
        policyRules,
      });

      // Then submit the claim with the evaluation
      const submittedClaimId = await submitClaim({
        claimantEmail: email,
        documentType: selectedDocument.type,
        storageId: selectedDocument.storageId,
        extractedDetails: editableDetails,
        aiEvaluation,
      });
      setClaimId(submittedClaimId);
      setFormState("submitted");
    } catch (_error) {
      toast.error("Failed to submit claim");
      setFormState("editing");
    }
  };

  const handleStartNew = () => {
    setEditableDetails(null);
    setFormState("extracting");
    setClaimId(undefined);
    hasExtracted = true;
    if (onComplete) {
      onComplete();
    } else {
      onBack();
    }
  };

  if (formState === "extracting") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <Sparkles loop animateOnView className="text-muted-foreground" />
            <span className="font-medium text-muted-foreground">
              Extracting data
            </span>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (formState === "submitted") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="mb-4 flex gap-1 text-green-800">
          <CircleCheck />
          <p className="font-bold">Claim Submitted Successfully!</p>
        </div>

        <p className="mb-6 text-gray-600">
          Your claim has been submitted with claim number:{" "}
          <span className="font-mono font-semibold">{claimId}</span>
        </p>
        <Button type="button" onClick={handleStartNew}>
          Submit Another Claim
        </Button>
      </div>
    );
  }

  if (!editableDetails) {
    return null;
  }

  const isSubmitting = formState === "submitting";

  return (
    <ScrollArea className="h-full">
      <div className="pr-4">
        <p className="mb-8 text-gray-600">
          Please review the extracted information and make any necessary
          corrections:
        </p>

        <div className="space-y-4 rounded-lg border bg-white p-6">
        <div>
          <label
            htmlFor="document-type-input"
            className="mb-2 block font-medium text-gray-700 text-sm"
          >
            Document Type
          </label>
          <input
            id="document-type-input"
            type="text"
            value={selectedDocument?.name || ""}
            disabled
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="amount-input"
            className="mb-2 block font-medium text-gray-700 text-sm"
          >
            Amount ($)
          </label>
          <input
            id="amount-input"
            type="number"
            step="0.01"
            value={editableDetails.amount}
            onChange={(e) =>
              setEditableDetails({
                ...editableDetails,
                amount: Number.parseFloat(e.target.value) || 0,
              })
            }
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="date-input"
            className="mb-2 block font-medium text-gray-700 text-sm"
          >
            Date
          </label>
          <input
            id="date-input"
            type="date"
            value={editableDetails.date}
            onChange={(e) =>
              setEditableDetails({
                ...editableDetails,
                date: e.target.value,
              })
            }
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="parties-input"
            className="mb-2 block font-medium text-gray-700 text-sm"
          >
            Parties Involved
          </label>
          <textarea
            id="parties-input"
            value={editableDetails.parties.join(", ")}
            onChange={(e) =>
              setEditableDetails({
                ...editableDetails,
                parties: e.target.value
                  .split(",")
                  .map((p) => p.trim())
                  .filter((p) => p),
              })
            }
            rows={3}
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="Separate parties with commas"
          />
        </div>

        <div>
          <label
            htmlFor="description-input"
            className="mb-2 block font-medium text-gray-700 text-sm"
          >
            Description
          </label>
          <textarea
            id="description-input"
            value={editableDetails.description}
            onChange={(e) =>
              setEditableDetails({
                ...editableDetails,
                description: e.target.value,
              })
            }
            rows={4}
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" onClick={onBack} variant="outline" disabled={isSubmitting}>
            Back
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Claim"}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
