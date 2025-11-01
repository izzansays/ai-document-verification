import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type HelpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            AI Document Verification POC
          </DialogTitle>
          <DialogDescription>
            This is a proof-of-concept (POC) application demonstrating an
            AI-powered insurance claims processing system. It uses AI to
            automatically analyze claim documents, extract relevant information,
            and provide recommendations for claim approval or rejection.{" "}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section>
            <h3 className="mb-2 font-semibold text-lg">How to Test</h3>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 font-medium">1. Submit Claim Tab</h4>
                <ul className="ml-6 list-disc space-y-1 text-muted-foreground text-sm">
                  <li>Select one of the three document types available</li>
                  <li>Click "Next" to proceed to document upload</li>
                  <li>
                    The system will analyze the document using AI and extract
                    key information
                  </li>
                  <li>
                    Review and edit the extracted data in the form (all fields
                    are editable)
                  </li>
                  <li>
                    Submit the claim to see it appear in the Admin Dashboard
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-1 font-medium">2. Admin Dashboard Tab</h4>
                <ul className="ml-6 list-disc space-y-1 text-muted-foreground text-sm">
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
            <h3 className="mb-2 font-semibold text-lg">Expected Results</h3>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>
                <strong>Document Analysis:</strong> The relevant data such as
                dates, names and billed amounts are extracted from the selected
                document.
              </p>
              <p>
                <strong>AI Evaluation:</strong> Each claim receives an automated
                evaluation with a recommendation (Approve/Reject), confidence
                level (High/Medium/Low), and detailed reasoning explaining the
                decision.
              </p>
              <p>
                <strong>Data Persistence:</strong> All claims, evaluations, and
                decisions are stored in a PostgreSQL database and persist
                between sessions.
              </p>
              <p>
                <strong>Real-time Updates:</strong> The admin dashboard updates
                immediately when claims are submitted or status changes are
                made.
              </p>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Got it, let's start!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useHelpModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenHelp = localStorage.getItem("hasSeenHelp");
    if (!hasSeenHelp) {
      setOpen(true);
    }
  }, []);

  const openHelp = () => setOpen(true);

  const closeHelp = (shouldOpen: boolean) => {
    setOpen(shouldOpen);
    if (!shouldOpen) {
      localStorage.setItem("hasSeenHelp", "true");
    }
  };

  return { open, openHelp, closeHelp };
}
