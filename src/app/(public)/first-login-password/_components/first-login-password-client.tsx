// src/app/(public)/first-login-password/_components/first-login-password-client.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api-client";
import { updatePasswordOnFirstLogin } from "@/lib/auth";
import { setAccessToken } from "@/lib/auth-token-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function FirstLoginPasswordClient() {
  const router = useRouter();
  const { user, isAuthenticated, mustChangePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }
  if (!mustChangePassword) {
    router.replace("/events");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation don't match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePasswordOnFirstLogin(user!.nameid, { currentPassword, newPassword });
      toast.success("Password set — signing you in.");
      // the JWT's mustChangePasswordOnFirstLogin claim is now stale (still says
      // "true" until the token is refreshed) — force a fresh token so the app
      // stops redirecting back to this page
      setAccessToken(null);
      router.replace("/login");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't update your password.";
      toast.error("Update failed", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-background-gray-secondary_alt px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-text-primary">Set Your Password</h1>
        <p className="mb-6 text-sm text-text-tertiary">
          You're using a default password. Choose a new one to continue.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm text-text-secondary">Default Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-text-secondary">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-text-secondary">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-brand-500 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}