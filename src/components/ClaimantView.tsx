import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

type DocumentType = "medical_bill" | "vehicle_repair" | "police_report";

interface ExtractedDetails {
  amount: number;
  date: string;
  parties: string[];
  description: string;
}

export function ClaimantView() {
  const [step, setStep] = useState<"select" | "review" | "submitted">("select");
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [extractedDetails, setExtractedDetails] = useState<ExtractedDetails | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [editableDetails, setEditableDetails] = useState<ExtractedDetails | null>(null);
  const [claimantEmail, setClaimantEmail] = useState("demo@example.com");

  const documents = useQuery(api.claims.getAvailableDocuments) || [];
  const userClaims = useQuery(api.claims.getUserClaims, { claimantEmail }) || [];
  const extractDetails = useAction(api.ai.extractDocumentDetails);
  const submitClaim = useMutation(api.claims.submitClaim);

  const handleDocumentSelect = async (document: any) => {
    setSelectedDocument(document);
    setIsExtracting(true);
    
    try {
      const details = await extractDetails({
        documentType: document.type,
        documentUrl: document.url,
      });
      setExtractedDetails(details);
      setEditableDetails(details);
      setStep("review");
    } catch (error) {
      toast.error("Failed to extract document details");
      console.error(error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!selectedDocument || !editableDetails) return;

    try {
      await submitClaim({
        claimantEmail,
        documentType: selectedDocument.type,
        documentUrl: selectedDocument.url,
        extractedDetails: editableDetails,
      });
      toast.success("Claim submitted successfully!");
      setStep("submitted");
    } catch (error) {
      toast.error("Failed to submit claim");
      console.error(error);
    }
  };

  const handleStartNew = () => {
    setStep("select");
    setSelectedDocument(null);
    setExtractedDetails(null);
    setEditableDetails(null);
  };

  if (step === "select") {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Submit New Claim</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Claimant Email (Demo Mode)
              </label>
              <input
                type="email"
                value={claimantEmail}
                onChange={(e) => setClaimantEmail(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <p className="text-gray-600 mb-8">Select a document type to begin your claim submission:</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleDocumentSelect(doc)}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <DocumentIcon type={doc.type} />
                  </div>
                  <h3 className="font-semibold mb-2">{doc.name}</h3>
                  <p className="text-sm text-gray-600">{doc.description}</p>
                </div>
              </div>
            ))}
          </div>

          {isExtracting && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Extracting document details...</p>
            </div>
          )}

          {userClaims.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Your Previous Claims</h3>
              <div className="space-y-3">
                {userClaims.map((claim) => (
                  <div key={claim._id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{claim.documentType.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-gray-600">Amount: ${claim.extractedDetails.amount}</p>
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(claim._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      claim.status === "approved" ? "bg-green-100 text-green-800" :
                      claim.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {claim.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === "review" && editableDetails) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Review Extracted Details</h2>
          <p className="text-gray-600 mb-6">
            Please review the extracted information and make any necessary corrections:
          </p>

          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claimant Email
              </label>
              <input
                type="email"
                value={claimantEmail}
                onChange={(e) => setClaimantEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <input
                type="text"
                value={selectedDocument?.name || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={editableDetails.amount}
                onChange={(e) => setEditableDetails({
                  ...editableDetails,
                  amount: parseFloat(e.target.value) || 0
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={editableDetails.date}
                onChange={(e) => setEditableDetails({
                  ...editableDetails,
                  date: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parties Involved
              </label>
              <textarea
                value={editableDetails.parties.join(", ")}
                onChange={(e) => setEditableDetails({
                  ...editableDetails,
                  parties: e.target.value.split(",").map(p => p.trim()).filter(p => p)
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Separate parties with commas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editableDetails.description}
                onChange={(e) => setEditableDetails({
                  ...editableDetails,
                  description: e.target.value
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setStep("select")}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmitClaim}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit Claim
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "submitted") {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Claim Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your claim has been submitted and is now under review. You can check the status in the admin dashboard.
          </p>
          <button
            onClick={handleStartNew}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Another Claim
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function DocumentIcon({ type }: { type: DocumentType }) {
  switch (type) {
    case "medical_bill":
      return (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "vehicle_repair":
      return (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      );
    case "police_report":
      return (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    default:
      return null;
  }
}
