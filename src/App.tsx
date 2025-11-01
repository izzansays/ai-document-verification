import { CircleHelp } from "lucide-react";
import { useState } from "react";
import { Toaster } from "sonner";
import { AdminView } from "./components/AdminView";
import { ClaimantView } from "./components/ClaimantView";
import { HelpDialog, useHelpModal } from "./components/HelpDialog";
import { Button } from "./components/ui/button";

export default function App() {
  const [activeTab, setActiveTab] = useState<"claimant" | "admin">("claimant");
  const { open, openHelp, closeHelp } = useHelpModal();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="flex w-full items-center justify-between px-4 py-2">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                className={`rounded-md px-2 py-1 font-medium text-sm transition-all ${
                  activeTab === "claimant"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("claimant")}
              >
                Claimant Portal
              </button>
              <button
                type="button"
                className={`rounded-md px-2 py-1 font-medium text-sm transition-all ${
                  activeTab === "admin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("admin")}
              >
                Admin Dashboard
              </button>
            </div>
          </div>
          <Button onClick={openHelp} size="sm" variant="ghost">
            <CircleHelp className="mr-1 size-4" />
            Help
          </Button>
        </div>
      </header>
      <main className="flex-1">
        {activeTab === "claimant" ? <ClaimantView /> : <AdminView />}
      </main>
      <Toaster position="top-right" />
      <HelpDialog onOpenChange={closeHelp} open={open} />
    </div>
  );
}
