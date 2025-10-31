import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { ClaimantView } from "./components/ClaimantView";
import { AdminView } from "./components/AdminView";

export default function App() {
  const [activeTab, setActiveTab] = useState<"claimant" | "admin">("claimant");
  const initializeDocuments = useMutation(api.setup.initializeDocuments);

  useEffect(() => {
    // Initialize documents on app load
    initializeDocuments();
  }, [initializeDocuments]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="flex justify-between items-center px-4 h-16">
          <h2 className="text-xl font-semibold text-blue-600">Insurance Claims POC</h2>
          <div className="text-sm text-gray-600">Demo Mode - No Authentication Required</div>
        </div>
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab("claimant")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "claimant"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Claimant Portal
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "admin"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Admin Dashboard
          </button>
        </div>
      </header>
      <main className="flex-1">
        {activeTab === "claimant" ? <ClaimantView /> : <AdminView />}
      </main>
      <Toaster />
    </div>
  );
}
