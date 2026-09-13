// src/context/auth-context.tsx
"use client";

import { logout as apiLogout, login as apiLogin, refreshAccessToken } from "@/lib/auth";
import { getAccessToken, setAccessToken, subscribeToAccessToken } from "@/lib/auth-token-store";
import { decodeAccessToken } from "@/lib/decode-token";
import { DecodedAccessToken } from "@/utils/mindaras-api-types";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextValue = {
  user: DecodedAccessToken | null;
  isLoading: boolean; // true only during the initial silent-refresh check on app boot
  isAuthenticated: boolean;
  isAdmin: boolean;
  mustChangePassword: boolean;
  signIn: (userName: string, passWord: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(getAccessToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return subscribeToAccessToken(setTokenState);
  }, []);

  // On app boot, there's no access token in memory yet (page was just loaded/reloaded) —
  // silently try to mint a fresh one from the HttpOnly refresh cookie before deciding
  // whether the person is actually logged out.
  useEffect(() => {
    refreshAccessToken()
      .then((res) => setAccessToken(res.accessToken))
      .catch(() => setAccessToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  const user = token ? decodeAccessToken(token) : null;

  async function signIn(userName: string, passWord: string) {
    const res = await apiLogin({ userName, passWord });
    setAccessToken(res.accessToken);
  }

  async function signOut() {
    try {
      await apiLogout();
    } finally {
      setAccessToken(null);
      router.push("/login");
    }
  }

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "Administrator",
    mustChangePassword: user?.mustChangePasswordOnFirstLogin === "true",
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}