import type { Id } from "../../../convex/_generated/dataModel";
import { StatusBadge } from "../ui/status-badge";

type ClaimStatus = "pending" | "approved" | "rejected";

type Claim = {
  _id: Id<"claims">;
  documentType: string;
  claimantEmail: string;
  status: ClaimStatus;
  extractedDetails: {
    amount: number;
  };
  _creationTime: number;
};

type ClaimsSidebarProps = {
  selectedStatus: ClaimStatus | "all";
  onStatusChange: (status: ClaimStatus | "all") => void;
  claims: Claim[];
  selectedClaimId: Id<"claims"> | null;
  onClaimSelect: (claimId: Id<"claims">) => void;
};

const formatDocumentType = (type: string) =>
  type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

export function ClaimsSidebar({
  selectedStatus,
  onStatusChange,
  claims,
  selectedClaimId,
  onClaimSelect,
}: ClaimsSidebarProps) {
  return (
    <div className="flex w-[350px] flex-col border-gray-200 border-r bg-white">
      <div className="border-gray-200 border-b p-4">
        <div className="space-y-2">
          <label
            htmlFor="status-filter"
            className="block font-medium text-gray-700 text-sm"
          >
            Filter by Status
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) =>
              onStatusChange(e.target.value as ClaimStatus | "all")
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Claims</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {claims.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No claims found</div>
        ) : (
          <div>
            {claims.map((claim) => (
              <button
                type="button"
                key={claim._id}
                onClick={() => onClaimSelect(claim._id)}
                className={`w-full cursor-pointer border-b p-3 text-left transition-colors ${
                  selectedClaimId === claim._id
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <span className="font-medium text-sm">
                    {formatDocumentType(claim.documentType)}
                  </span>
                  <StatusBadge status={claim.status} />
                </div>
                <div className="text-gray-600 text-sm">
                  <p>Claimant: {claim.claimantEmail}</p>
                  <p>
                    Amount: ${claim.extractedDetails.amount.toLocaleString()}
                  </p>
                  <p>
                    Date: {new Date(claim._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
