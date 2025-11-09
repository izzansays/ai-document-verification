import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ClaimDetails } from "./ClaimDetails";
import { ClaimsSidebar } from "./ClaimsSidebar";
import { EmptyState } from "./EmptyState";

type ClaimStatus = "pending" | "approved" | "rejected";

export function AdminView() {
  const [selectedStatus, setSelectedStatus] = useState<ClaimStatus | "all">(
    "all"
  );
  const [selectedClaimId, setSelectedClaimId] = useState<Id<"claims"> | null>(
    null
  );
  const [adminNotes, setAdminNotes] = useState("");

  const allClaims = useQuery(api.claims.getClaimsByStatus, {}) || [];

  const claims =
    selectedStatus === "all"
      ? allClaims
      : allClaims.filter((claim) => claim.status === selectedStatus);

  const selectedClaim = useQuery(
    api.claims.getClaim,
    selectedClaimId ? { claimId: selectedClaimId } : "skip"
  );

  const updateClaimStatus = useMutation(api.claims.updateClaimStatus);

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    if (!selectedClaimId) {
      return;
    }

    try {
      await updateClaimStatus({
        claimId: selectedClaimId,
        status,
        adminNotes: adminNotes.trim() || undefined,
      });
      toast.success(`Claim ${status} successfully!`);
      setAdminNotes("");
    } catch {
      toast.error(`Failed to ${status} claim`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ClaimsSidebar
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        claims={claims}
        selectedClaimId={selectedClaimId}
        onClaimSelect={setSelectedClaimId}
      />

      <div className="flex flex-1 flex-col">
        {selectedClaim ? (
          <ClaimDetails
            claim={selectedClaim}
            adminNotes={adminNotes}
            onAdminNotesChange={setAdminNotes}
            onStatusUpdate={handleStatusUpdate}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
