"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface GlobalContextType {
  currentPath: string;
  updatePath: (path: string) => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const currentPath = usePathname();
  // const { logout, setLoading } = useAuth();

  const updatePath = (path: string) => {
    router.push(path);
    setGlobalSearch("");
    setMobileOpen(false);
  };

  return (
    <GlobalContext.Provider
      value={{
        currentPath,
        updatePath,
        globalSearch,
        setGlobalSearch,
        mobileOpen,
        setMobileOpen,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobalData = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalData doit être utilisé dans GlobalProvider");
  }
  return context;
};
