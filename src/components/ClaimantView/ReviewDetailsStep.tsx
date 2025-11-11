import { useAction, useMutation, useQuery } from "convex/react";
import { CircleCheck } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigation, useClaimData, useReviewForm } from "@/stores/claimantStore";
import { useUser } from "@/stores/userStore";
import { api } from "../../../convex/_generated/api";
import { Sparkles } from "../animate-ui/icons/sparkles";

export function ReviewDetailsStep() {
  const { email } = useUser();
  const { selectedDocument, backToDocumentSelect, completeAndReturnHome } = useNavigation();
  const { claimId, setClaimId } = useClaimData();
  const { formStatus, extractedDetails, setFormStatus, setExtractedDetails } = useReviewForm();

  const extractDetailsAction = useAction(api.ai.extractDocumentDetails);
  const evaluateClaim = useAction(api.ai.evaluateClaim);
  const submitClaim = useMutation(api.claims.submitClaim);
  const policyRules = useQuery(api.claims.getPolicyRules);

  // Extract details when document is selected (only once per document)
  useEffect(() => {
    // Don't extract if no document or already have details
    if (!selectedDocument || extractedDetails !== null) {
      return;
    }

    // Only extract if status is "extracting" (initial state when entering step 2)
    if (formStatus !== "extracting") {
      return;
    }

    const extract = async () => {
      try {
        const details = await extractDetailsAction({
          documentType: selectedDocument.type,
          storageId: selectedDocument.storageId,
        });
        setExtractedDetails(details);
        setFormStatus("editing");
      } catch (_error) {
        toast.error("Failed to extract document details");
        setFormStatus("editing");
      }
    };

    extract();
  }, [selectedDocument, extractedDetails, formStatus, extractDetailsAction, setExtractedDetails, setFormStatus]);

  const handleSubmit = async () => {
    if (!(selectedDocument && extractedDetails && email && policyRules)) {
      return;
    }

    try {
      setFormStatus("submitting");

      // First, evaluate the claim using AI
      const aiEvaluation = await evaluateClaim({
        extractedDetails,
        policyRules,
      });

      // Then submit the claim with the evaluation
      const submittedClaimId = await submitClaim({
        claimantEmail: email,
        documentType: selectedDocument.type,
        storageId: selectedDocument.storageId,
        extractedDetails,
        aiEvaluation,
      });
      setClaimId(submittedClaimId);
      setFormStatus("submitted");
    } catch (_error) {
      toast.error("Failed to submit claim");
      setFormStatus("editing");
    }
  };

  if (formStatus === "extracting") {
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

  if (formStatus === "submitted") {
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
        <Button type="button" onClick={completeAndReturnHome}>
          Submit Another Claim
        </Button>
      </div>
    );
  }

  if (!extractedDetails) {
    return null;
  }

  const isSubmitting = formStatus === "submitting";

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
            value={extractedDetails.amount}
            onChange={(e) =>
              setExtractedDetails({
                ...extractedDetails,
                amount: Number.parseFloat(e.target.value) || 0,
              })
            }
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
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
            value={extractedDetails.date}
            onChange={(e) =>
              setExtractedDetails({
                ...extractedDetails,
                date: e.target.value,
              })
            }
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
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
            value={extractedDetails.parties.join(", ")}
            onChange={(e) =>
              setExtractedDetails({
                ...extractedDetails,
                parties: e.target.value
                  .split(",")
                  .map((p) => p.trim())
                  .filter((p) => p),
              })
            }
            rows={3}
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
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
            value={extractedDetails.description}
            onChange={(e) =>
              setExtractedDetails({
                ...extractedDetails,
                description: e.target.value,
              })
            }
            rows={4}
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
          />
        </div>
      </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" onClick={backToDocumentSelect} variant="outline" disabled={isSubmitting}>
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
