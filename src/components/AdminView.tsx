import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

type ClaimStatus = "pending" | "approved" | "rejected";

export function AdminView() {
  const [selectedStatus, setSelectedStatus] = useState<ClaimStatus | "all">("all");
  const [selectedClaimId, setSelectedClaimId] = useState<Id<"claims"> | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const claims = useQuery(api.claims.getClaimsByStatus, 
    selectedStatus === "all" ? {} : { status: selectedStatus }
  ) || [];
  
  const selectedClaim = useQuery(api.claims.getClaim, 
    selectedClaimId ? { claimId: selectedClaimId } : "skip"
  );
  
  const updateClaimStatus = useMutation(api.claims.updateClaimStatus);

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    if (!selectedClaimId) return;

    try {
      await updateClaimStatus({
        claimId: selectedClaimId,
        status,
        adminNotes: adminNotes.trim() || undefined,
      });
      toast.success(`Claim ${status} successfully!`);
      setAdminNotes("");
    } catch (error) {
      toast.error(`Failed to ${status} claim`);
      console.error(error);
    }
  };

  const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDocumentType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Claims Dashboard</h2>
          
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ClaimStatus | "all")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Claims</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Claims List */}
        <div className="flex-1 overflow-y-auto">
          {claims.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No claims found
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {claims.map((claim) => (
                <div
                  key={claim._id}
                  onClick={() => setSelectedClaimId(claim._id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedClaimId === claim._id
                      ? "bg-blue-50 border-2 border-blue-200"
                      : "hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">
                      {formatDocumentType(claim.documentType)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                      {claim.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Claimant: {claim.claimantEmail}</p>
                    <p>Amount: ${claim.extractedDetails.amount.toLocaleString()}</p>
                    <p>Date: {new Date(claim._creationTime).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedClaim ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {formatDocumentType(selectedClaim.documentType)} Claim
                    </h3>
                    <p className="text-gray-600">
                      Submitted by {selectedClaim.claimantEmail} on{" "}
                      {new Date(selectedClaim._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedClaim.status)}`}>
                    {selectedClaim.status.toUpperCase()}
                  </span>
                </div>

                {/* Document Preview */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3">Document</h4>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">Document URL:</p>
                    <p className="font-mono text-sm">{selectedClaim.documentUrl}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      * In a real implementation, this would show a preview of the actual document
                    </p>
                  </div>
                </div>

                {/* Extracted Details */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3">Extracted Details</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <p className="text-lg font-semibold text-green-600">
                        ${selectedClaim.extractedDetails.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <p>{selectedClaim.extractedDetails.date}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parties Involved</label>
                      <p>{selectedClaim.extractedDetails.parties.join(", ")}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <p>{selectedClaim.extractedDetails.description}</p>
                    </div>
                  </div>
                </div>

                {/* AI Evaluation */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3">AI Policy Evaluation</h4>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedClaim.aiEvaluation.approved 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {selectedClaim.aiEvaluation.approved ? "APPROVED" : "FLAGGED"}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{selectedClaim.aiEvaluation.reason}</p>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${
                          selectedClaim.aiEvaluation.policyCheck.withinLimit ? "bg-green-500" : "bg-red-500"
                        }`}></span>
                        Within Claim Limit
                      </div>
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${
                          selectedClaim.aiEvaluation.policyCheck.withinDateWindow ? "bg-green-500" : "bg-red-500"
                        }`}></span>
                        Within Policy Window
                      </div>
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${
                          selectedClaim.aiEvaluation.policyCheck.validParties ? "bg-green-500" : "bg-red-500"
                        }`}></span>
                        Valid Parties
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                {selectedClaim.status === "pending" && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-3">Admin Review</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Notes (Optional)
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Add any notes about your decision..."
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleStatusUpdate("approved")}
                          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Approve Claim
                        </button>
                        <button
                          onClick={() => handleStatusUpdate("rejected")}
                          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Reject Claim
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Review History */}
                {selectedClaim.status !== "pending" && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-3">Review History</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        Status: <span className="font-medium">{selectedClaim.status.toUpperCase()}</span>
                      </p>
                      {selectedClaim.reviewedAt && (
                        <p className="text-sm text-gray-600">
                          Reviewed: {new Date(selectedClaim.reviewedAt).toLocaleString()}
                        </p>
                      )}
                      {selectedClaim.adminNotes && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
                          <p className="text-sm text-gray-600">{selectedClaim.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">Select a claim to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
