import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginScreenProps = {
  onLogin: (email: string) => void;
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("demo@example.com");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLogin(email.trim());
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Half - Help Content */}
      <div className="flex w-1/2 flex-col justify-center bg-gray-50 p-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-4 font-bold text-3xl">
            AI Document Verification POC
          </h1>
          <p className="mb-8 text-gray-600 text-lg">
            This is a proof-of-concept (POC) application demonstrating an
            AI-powered insurance claims processing system. It uses AI to
            automatically analyze claim documents, extract relevant information,
            and provide recommendations for claim approval or rejection.
          </p>

          <div className="space-y-6">
            <section>
              <h3 className="mb-3 font-semibold text-xl">How to Test</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">1. Submit Claim Tab</h4>
                  <ul className="ml-6 list-disc space-y-1 text-gray-600 text-sm">
                    <li>Select one of the three document types available</li>
                    <li>Click "Next" to proceed to document upload</li>
                    <li>
                      The system will analyze the document using AI and extract
                      key information
                    </li>
                    <li>
                      Review and edit the extracted data in the form (all
                      fields are editable)
                    </li>
                    <li>
                      Submit the claim to see it appear in the Admin Dashboard
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">2. Admin Dashboard Tab</h4>
                  <ul className="ml-6 list-disc space-y-1 text-gray-600 text-sm">
                    <li>View all submitted claims in the sidebar</li>
                    <li>
                      Filter claims by status: Pending, Approved, Rejected,
                      Overdue or All
                    </li>
                    <li>Click on a claim to view detailed information</li>
                    <li>
                      Review the AI evaluation including recommendation,
                      confidence level, and reasoning
                    </li>
                    <li>Approve or reject pending claims</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-3 font-semibold text-xl">Expected Results</h3>
              <div className="space-y-2 text-gray-600 text-sm">
                <p>
                  <strong>Document Analysis:</strong> The relevant data such as
                  dates, names and billed amounts are extracted from the
                  selected document.
                </p>
                <p>
                  <strong>AI Evaluation:</strong> Each claim receives an
                  automated evaluation with a recommendation (Approve/Reject),
                  confidence level (High/Medium/Low), and detailed reasoning
                  explaining the decision.
                </p>
                <p>
                  <strong>Data Persistence:</strong> All claims, evaluations,
                  and decisions are stored in a PostgreSQL database and persist
                  between sessions.
                </p>
                <p>
                  <strong>Real-time Updates:</strong> The admin dashboard
                  updates immediately when claims are submitted or status
                  changes are made.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Right Half - Email Input */}
      <div className="flex w-1/2 items-center justify-center bg-white">
        <div className="w-full max-w-md space-y-6 p-8">
          <div className="text-center">
            <h2 className="font-bold text-2xl tracking-tight">Welcome</h2>
            <p className="mt-2 text-gray-600 text-sm">
              Enter your email to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>

          <p className="text-center text-gray-500 text-xs">
            This is a demo application. No password required.
          </p>
        </div>
      </div>
    </div>
  );
}
