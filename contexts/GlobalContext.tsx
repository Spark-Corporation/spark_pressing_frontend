"use client";

import React, { createContext, useContext, useEffect, useState, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface ProfileUser {
  nom: string;
  email: string;
  role: string;
  agency: string;
}

interface GlobalContextType {
  currentPath: string;
  updatePath: (path: string) => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  profileUser: ProfileUser | null;
  setProfileUser: (u: ProfileUser | null) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

function PathnameBridge({ setCurrentPath }: { setCurrentPath: (p: string) => void }) {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) setCurrentPath(pathname);
  }, [pathname, setCurrentPath]);
  return null;
}

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [currentPath, setCurrentPath] = useState("");
  const router = useRouter();

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
        profileUser,
        setProfileUser,
      }}
    >
      <Suspense fallback={null}>
        <PathnameBridge setCurrentPath={setCurrentPath} />
      </Suspense>
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
