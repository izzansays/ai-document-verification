import type { Id } from "../../../convex/_generated/dataModel";
import { AIEvaluationBadge } from "../ui/ai-evaluation-badge";
import { DetailField } from "../ui/detail-field";
import { ScrollArea } from "../ui/scroll-area";
import { StatusBadge } from "../ui/status-badge";

type ClaimStatus = "pending" | "approved" | "rejected";

type Claim = {
  _id: Id<"claims">;
  documentType: string;
  claimantEmail: string;
  status: ClaimStatus;
  documentUrl: string;
  extractedDetails: {
    amount: number;
    date: string;
    parties: string[];
    description: string;
  };
  aiEvaluation: {
    approved: boolean;
    reason: string;
    policyCheck: {
      withinLimit: boolean;
      withinDateWindow: boolean;
      validParties: boolean;
    };
  };
  _creationTime: number;
  reviewedAt?: number;
  adminNotes?: string;
};

type ClaimDetailsProps = {
  claim: Claim;
  adminNotes: string;
  onAdminNotesChange: (notes: string) => void;
  onStatusUpdate: (status: "approved" | "rejected") => void;
};

const formatDocumentType = (type: string) =>
  type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

export function ClaimDetails({
  claim,
  adminNotes,
  onAdminNotesChange,
  onStatusUpdate,
}: ClaimDetailsProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        <div className="rounded-lg border bg-white p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="font-bold text-2xl">
              {formatDocumentType(claim.documentType)} Claim
            </h3>
            <p className="text-gray-600">
              Submitted by {claim.claimantEmail} on{" "}
              {new Date(claim._creationTime).toLocaleDateString()}
            </p>
          </div>
          <StatusBadge status={claim.status} size="md" />
        </div>

        {/* Document Preview and Extracted Details */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Document Preview */}
          <div>
            <h4 className="mb-3 font-semibold text-lg">Document</h4>
            <div className="rounded-lg border bg-gray-50 p-4">
              <img
                src={claim.documentUrl}
                alt="Claim document"
                width={800}
                height={600}
                className="mx-auto max-h-96 w-auto rounded-lg object-contain"
              />
            </div>
          </div>

          {/* Extracted Details */}
          <div>
            <h4 className="mb-3 font-semibold text-lg">Extracted Details</h4>
            <div className="space-y-4">
              <DetailField label="Amount">
                <p>{`$${claim.extractedDetails.amount.toLocaleString()}`}</p>
              </DetailField>
              <DetailField label="Date">
                <p>{claim.extractedDetails.date}</p>
              </DetailField>
              <DetailField label="Parties Involved">
                <ul className="list-inside list-disc space-y-1">
                  {claim.extractedDetails.parties.map((party) => (
                    <li key={party}>{party}</li>
                  ))}
                </ul>
              </DetailField>
              <DetailField label="Description">
                <p>{claim.extractedDetails.description}</p>
              </DetailField>
            </div>
          </div>
        </div>

        {/* AI Evaluation */}
        <div className="mb-6">
          <h4 className="mb-3 font-semibold text-lg">AI Policy Evaluation</h4>
          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center">
              <AIEvaluationBadge
                approved={claim.aiEvaluation.approved}
                size="md"
              />
            </div>
            <p className="mb-4 text-gray-700">{claim.aiEvaluation.reason}</p>

            <div className="grid gap-4 text-sm md:grid-cols-3">
              <div className="flex items-center">
                <span
                  className={`mr-2 h-3 w-3 rounded-full ${
                    claim.aiEvaluation.policyCheck.withinLimit
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
                Within Claim Limit
              </div>
              <div className="flex items-center">
                <span
                  className={`mr-2 h-3 w-3 rounded-full ${
                    claim.aiEvaluation.policyCheck.withinDateWindow
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
                Within Policy Window
              </div>
              <div className="flex items-center">
                <span
                  className={`mr-2 h-3 w-3 rounded-full ${
                    claim.aiEvaluation.policyCheck.validParties
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
                Valid Parties
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        {claim.status === "pending" && (
          <div className="border-t pt-6">
            <h4 className="mb-3 font-semibold text-lg">Admin Review</h4>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="admin-notes"
                  className="mb-2 block font-medium text-gray-700 text-sm"
                >
                  Admin Notes (Optional)
                </label>
                <textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => onAdminNotesChange(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about your decision..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => onStatusUpdate("approved")}
                  className="rounded-md bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700"
                >
                  Approve Claim
                </button>
                <button
                  type="button"
                  onClick={() => onStatusUpdate("rejected")}
                  className="rounded-md bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700"
                >
                  Reject Claim
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review History */}
        {claim.status !== "pending" && (
          <div className="border-t pt-6">
            <h4 className="mb-3 font-semibold text-lg">Review History</h4>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-gray-600 text-sm">
                Status:{" "}
                <span className="font-medium">
                  {claim.status.toUpperCase()}
                </span>
              </p>
              {claim.reviewedAt && (
                <p className="text-gray-600 text-sm">
                  Reviewed: {new Date(claim.reviewedAt).toLocaleString()}
                </p>
              )}
              {claim.adminNotes && (
                <div className="mt-2">
                  <p className="font-medium text-gray-700 text-sm">
                    Admin Notes:
                  </p>
                  <p className="text-gray-600 text-sm">{claim.adminNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </ScrollArea>
  );
}
