type ClaimantDetailsProps = {
  claimantEmail: string;
  onEmailChange: (email: string) => void;
  userClaims: {
    _id: string;
    documentType: string;
    extractedDetails: { amount: number };
    _creationTime: number;
    status: string;
  }[];
};

export function ClaimantDetails({
  claimantEmail,
  onEmailChange,
  userClaims,
}: ClaimantDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 font-bold text-2xl">Submit New Claim</h2>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <label
            htmlFor="claimant-email"
            className="mb-2 block font-medium text-blue-800 text-sm"
          >
            Claimant Email (Demo Mode)
          </label>
          <input
            id="claimant-email"
            type="email"
            value={claimantEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full max-w-md rounded-md border border-blue-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>
      </div>

      {userClaims.length > 0 && (
        <div>
          <h3 className="mb-4 font-semibold text-xl">Your Previous Claims</h3>
          <div className="space-y-3">
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
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {claim.documentType.replace("_", " ").toUpperCase()}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Amount: ${claim.extractedDetails.amount}
                    </p>
                    <p className="text-gray-600 text-sm">
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
        </div>
      )}
    </div>
  );
}
