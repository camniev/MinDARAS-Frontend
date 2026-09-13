// src/app/(public)/login/_components/login-page-client.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPageClient() {
  const router = useRouter();
  const { signIn, isAuthenticated, mustChangePassword } = useAuth();
  const [userName, setUserName] = useState("");
  const [passWord, setPassWord] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // already logged in? bounce straight to the right place instead of showing the form
  if (isAuthenticated) {
    router.replace(mustChangePassword ? "/first-login-password" : "/events");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(userName, passWord);
      // signIn only sets the token; re-render will re-evaluate isAuthenticated above
      // and redirect accordingly on the next tick
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong.";
      toast.error("Login failed", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-background-gray-secondary_alt px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-text-primary">Sign In</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm text-text-secondary">Username</label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-text-secondary">Password</label>
            <input
              type="password"
              value={passWord}
              onChange={(e) => setPassWord(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-brand-500 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}