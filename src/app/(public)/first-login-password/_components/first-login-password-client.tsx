// src/app/(public)/first-login-password/_components/first-login-password-client.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api-client";
import { updatePasswordOnFirstLogin } from "@/lib/auth";
import { setAccessToken } from "@/lib/auth-token-store";
import { Locked3 } from "@tailgrids/icons";
import Image from "next/image";
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
    // <div className="flex h-full min-h-screen items-center justify-center bg-background-gray-secondary_alt px-4">
    //   <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm">
    //     <h1 className="mb-2 text-xl font-semibold text-text-primary">Set Your Password</h1>
    //     <p className="mb-6 text-sm text-text-tertiary">
    //       You're using a default password. Choose a new one to continue.
    //     </p>
    //     <form className="space-y-4" onSubmit={handleSubmit}>
    //       <div className="space-y-1.5">
    //         <label className="text-sm text-text-secondary">Default Password</label>
    //         <input
    //           type="password"
    //           value={currentPassword}
    //           onChange={(e) => setCurrentPassword(e.target.value)}
    //           required
    //           className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
    //         />
    //       </div>
    //       <div className="space-y-1.5">
    //         <label className="text-sm text-text-secondary">New Password</label>
    //         <input
    //           type="password"
    //           value={newPassword}
    //           onChange={(e) => setNewPassword(e.target.value)}
    //           minLength={8}
    //           required
    //           className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
    //         />
    //       </div>
    //       <div className="space-y-1.5">
    //         <label className="text-sm text-text-secondary">Confirm New Password</label>
    //         <input
    //           type="password"
    //           value={confirmPassword}
    //           onChange={(e) => setConfirmPassword(e.target.value)}
    //           minLength={8}
    //           required
    //           className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
    //         />
    //       </div>
    //       <button
    //         type="submit"
    //         disabled={isSubmitting}
    //         className="w-full rounded-md bg-brand-500 py-2.5 text-sm font-medium text-white disabled:opacity-60"
    //       >
    //         {isSubmitting ? "Updating…" : "Update Password"}
    //       </button>
    //     </form>
    //   </div>
    // </div>

    <div className="flex min-h-screen items-center justify-center bg-[#f0f1f7] px-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        {/* Left panel: background image + logo + agency name */}
        <div className="relative hidden min-h-[600px] flex-col items-center justify-center gap-6 p-10 md:flex">
          <Image
            src="/images/minda-assets/bg-inv-sys.png"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />

          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <div className="rounded-2xl bg-white p-2 shadow-lg">
              <Image
                src="/images/minda-assets/minda-logo-inv-sys.png"
                alt="Agency logo"
                width={160}
                height={160}
                className="h-auto w-40"
              />
            </div>
            <h2 className="text-2xl font-bold leading-tight text-white">
              MinDA Registration and Attendance System
            </h2>
          </div>
        </div>

        {/* Right panel: form */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">Set Your Password</h1>
          <p className="mb-8 text-sm font-medium text-text-secondary">
            You're using a default password. Choose a new one to continue.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <Locked3 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Default Password"
                className="w-full rounded-xl border-0 bg-[#eceefb] py-3.5 pl-12 pr-4 text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="relative">
              <Locked3 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                placeholder="New Password"
                className="w-full rounded-xl border-0 bg-[#eceefb] py-3.5 pl-12 pr-4 text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="relative">
              <Locked3 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
                placeholder="Confirm New Password"
                className="w-full rounded-xl border-0 bg-[#eceefb] py-3.5 pl-12 pr-4 text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-900 bg-brand-400 py-3.5 text-sm font-semibold text-gray-900 transition hover:bg-brand-500 disabled:opacity-60"
            >
              {isSubmitting ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}