// src/app/(with-layouts)/route-guard.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, mustChangePassword } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (mustChangePassword) {
      router.replace("/first-login-password");
    }
  }, [isLoading, isAuthenticated, mustChangePassword, router]);

  if (isLoading || !isAuthenticated || mustChangePassword) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-text-tertiary">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}