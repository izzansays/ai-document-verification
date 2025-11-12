import { create } from "zustand";
import type { Id } from "../../convex/_generated/dataModel";

// Types
type DocumentType = "medical_bill" | "vehicle_repair" | "police_report";

export type Document = {
  id: string;
  type: DocumentType;
  name: string;
  storageId: Id<"_storage">;
  url: string | null;
};

// Store interface
type ClaimantStore = {
  // Navigation & shared data
  step: 0 | 1 | 2;
  selectedDocument: Document | null;
  claimId: string | undefined;

  // Actions
  setStep: (step: 0 | 1 | 2) => void;
  setSelectedDocument: (document: Document | null) => void;
  setClaimId: (id: string | undefined) => void;

  // Combined actions for common workflows
  startClaim: () => void;
  selectDocumentAndContinue: (document: Document) => void;
  backToDocumentSelect: () => void;
  completeAndReturnHome: () => void;
  resetClaim: () => void;
};

// Create the store - no persistence, resets on refresh
export const useClaimantStore = create<ClaimantStore>((set) => ({
  // Navigation & shared data
  step: 0,
  selectedDocument: null,
  claimId: undefined,

  setStep: (step: 0 | 1 | 2) => {
    set({ step });
  },
  setSelectedDocument: (selectedDocument: Document | null) => {
    set({ selectedDocument });
  },
  setClaimId: (claimId: string | undefined) => {
    set({ claimId });
  },

  // Combined actions
  startClaim: () => {
    set({
      step: 1,
      selectedDocument: null,
      claimId: undefined,
    });
  },

  selectDocumentAndContinue: (document: Document) => {
    set({
      selectedDocument: document,
      step: 2,
    });
  },

  backToDocumentSelect: () => {
    set({
      step: 1,
      selectedDocument: null,
    });
  },

  completeAndReturnHome: () => {
    set({
      step: 0,
      selectedDocument: null,
      claimId: undefined,
    });
  },

  resetClaim: () => {
    set({
      step: 0,
      selectedDocument: null,
      claimId: undefined,
    });
  },
}));

// Convenience hooks that select only what components need
export const useNavigation = () => {
  const step = useClaimantStore((state) => state.step);
  const selectedDocument = useClaimantStore((state) => state.selectedDocument);
  const setSelectedDocument = useClaimantStore((state) => state.setSelectedDocument);
  const startClaim = useClaimantStore((state) => state.startClaim);
  const selectDocumentAndContinue = useClaimantStore((state) => state.selectDocumentAndContinue);
  const backToDocumentSelect = useClaimantStore((state) => state.backToDocumentSelect);
  const completeAndReturnHome = useClaimantStore((state) => state.completeAndReturnHome);

  return {
    step,
    selectedDocument,
    setSelectedDocument,
    startClaim,
    selectDocumentAndContinue,
    backToDocumentSelect,
    completeAndReturnHome,
  };
};

export const useClaimData = () => {
  const claimId = useClaimantStore((state) => state.claimId);
  const setClaimId = useClaimantStore((state) => state.setClaimId);

  return { claimId, setClaimId };
};
