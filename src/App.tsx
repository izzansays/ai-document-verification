import { CircleHelp, LogOut } from "lucide-react";
import { useState } from "react";
import { Toaster } from "sonner";
import { AdminView } from "./components/AdminView";
import { ClaimantView } from "./components/ClaimantView";
import { HelpDialog, useHelpModal } from "./components/HelpDialog";
import { LoginScreen } from "./components/LoginScreen";
import { Button } from "./components/ui/button";
import { useUser } from "./stores/userStore";

export default function App() {
  const [activeTab, setActiveTab] = useState<"claimant" | "admin">("claimant");
  const { open, openHelp, closeHelp } = useHelpModal();
  const { email, setEmail, logout } = useUser();

  // Show login screen if user is not logged in
  if (!email) {
    return <LoginScreen onLogin={setEmail} />;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex-none border-b bg-white/80 shadow-sm backdrop-blur-sm">
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
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{email}</span>
            <Button onClick={openHelp} size="sm" variant="ghost">
              <CircleHelp className="mr-1 size-4" />
              Help
            </Button>
            <Button onClick={logout} size="sm" variant="ghost">
              <LogOut className="mr-1 size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {activeTab === "claimant" ? <ClaimantView /> : <AdminView />}
      </main>
      <Toaster position="top-right" />
      <HelpDialog onOpenChange={closeHelp} open={open} />
    </div>
  );
}
