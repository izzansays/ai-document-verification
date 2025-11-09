import { createContext, useContext, useState, type ReactNode } from "react";

type UserContextType = {
  email: string | null;
  setEmail: (email: string) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [email, setEmailState] = useState<string | null>(() => {
    // Check localStorage for persisted email
    return localStorage.getItem("userEmail");
  });

  const setEmail = (newEmail: string) => {
    setEmailState(newEmail);
    localStorage.setItem("userEmail", newEmail);
  };

  const logout = () => {
    setEmailState(null);
    localStorage.removeItem("userEmail");
  };

  return (
    <UserContext.Provider value={{ email, setEmail, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
