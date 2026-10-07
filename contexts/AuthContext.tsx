"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { AuthState, User } from "@/lib/types";
import { AUTH_ROUTES } from "@/components/layout/ConditionalLayout";

interface AuthContextType extends AuthState {
  login: (token: string, user?: User) => void;
  logout: () => void;
  getCurrentUser: (currentUser: User) => void;
  setLoading: (isLoading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const empty: AuthState = {
      token: null,
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
    };

    if (typeof document === "undefined") return empty;

    const token = Cookies.get("token");
    const userCookie = Cookies.get("user");
    if (!token || !userCookie) return empty;

    try {
      return {
        token,
        currentUser: JSON.parse(userCookie) as User,
        isAuthenticated: true,
        isLoading: false,
      };
    } catch {
      Cookies.remove("token");
      Cookies.remove("user");
      return empty;
    }
  });

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth.isAuthenticated) return;
    const isAuthRoute = AUTH_ROUTES.some(
      (r) => pathname === r || pathname?.startsWith(r + "/"),
    );
    // if (!isAuthRoute) router.push("/login");
  }, [auth.isAuthenticated, pathname, router]);

  const login = (token: string, user?: User) => {
    Cookies.set("token", token, {
      expires: 1,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    if (user) {
      Cookies.set("user", JSON.stringify(user), {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    setAuth({
      token,
      currentUser: user ?? null,
      isAuthenticated: true,
      isLoading: false,
    });

    router.push("/");
  };

  const getCurrentUser = (currentUser: User) => {
    Cookies.set("user", JSON.stringify(currentUser), {
      expires: 1,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    setAuth((prev) => ({ ...prev, currentUser }));
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    setAuth({
      token: null,
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push("/login");
  };

  const setLoading = useCallback((isLoading: boolean) => {
    setAuth((prev) => ({ ...prev, isLoading }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...auth, login, logout, getCurrentUser, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return context;
};