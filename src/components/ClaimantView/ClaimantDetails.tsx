import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/contexts/UserContext";
import { api } from "../../../convex/_generated/api";

type ClaimantDetailsProps = {
  onStartClaim: () => void;
};

export function ClaimantDetails({ onStartClaim }: ClaimantDetailsProps) {
  const { email } = useUser();
  const userClaims = useQuery(api.claims.getUserClaims, {
    claimantEmail: email || "",
  });

  return (
    <div className="grid h-full grid-cols-2">
      {/* Left Panel - Welcome and Start Claim */}
      <div className="flex flex-col justify-center border-r bg-white p-12">
        <div className="mx-auto max-w-lg">
          <h1 className="mb-4 font-bold text-3xl">Claims Submission Portal</h1>
          <p className="mb-8 text-gray-600 text-lg leading-relaxed">
            Welcome to the claims submission portal. Click the button below to
            submit a new claim. Your claim will be automatically evaluated
            against your insurance policy details shown below. You can view your
            past claims and their status in the right panel.
          </p>
          <Button
            onClick={onStartClaim}
            size="lg"
            className="px-8 py-6 text-lg"
          >
            Submit New Claim
          </Button>

          {/* Policy Details */}
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-3 font-semibold text-blue-900 text-sm">
              Your Insurance Policy
            </h3>
            <p className="mb-3 text-blue-800 text-xs">
              Your current coverage includes:
            </p>
            <ul className="space-y-2 text-blue-900 text-xs">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold">•</span>
                <span>
                  <strong>Claim Limit:</strong> Maximum amount of $10,000
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold">•</span>
                <span>
                  <strong>Policy Period:</strong> January 1, 2024 - December 31,
                  2024
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold">•</span>
                <span>
                  <strong>Valid Parties:</strong> John Doe, Jane Smith, ABC
                  Insurance, XYZ Hospital, City Police Department
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Panel - Previous Claims */}
      <div className="flex flex-col bg-gray-50 p-8">
        <div className="mx-auto w-full max-w-2xl">
          <h2 className="mb-6 font-semibold text-2xl">Your Claims History</h2>

          <ScrollArea className="flex-1">
            {userClaims === undefined && (
              <div className="space-y-3 pr-4">
                <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
              </div>
            )}

            {userClaims && userClaims.length > 0 && (
              <div className="space-y-3 pr-4">
                {userClaims.map((claim) => {
                  let statusClass = "bg-yellow-100 text-yellow-800";
                  if (claim.status === "approved") {
                    statusClass = "bg-green-100 text-green-800";
                  } else if (claim.status === "rejected") {
                    statusClass = "bg-red-100 text-red-800";
                  }

                  return (
                    <div
                      key={claim._id}
                      className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div>
                        <p className="font-medium">
                          {claim.documentType.replace(/_/g, " ").toUpperCase()}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Amount: ${claim.extractedDetails.amount.toFixed(2)}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Submitted:{" "}
                          {new Date(claim._creationTime).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 font-medium text-sm ${statusClass}`}
                      >
                        {claim.status.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {userClaims && userClaims.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-500">
                  No claims submitted yet. Click "Submit New Claim" to get
                  started.
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
