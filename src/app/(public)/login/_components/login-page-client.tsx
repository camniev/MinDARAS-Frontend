// src/app/(public)/login/_components/login-page-client.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { ArrowRightSquare, Locked3, User2 } from "@tailgrids/icons";

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
          <h1 className="mb-2 text-3xl font-bold text-text-primary">Login</h1>
          <p className="mb-8 text-sm font-medium text-text-secondary">
            Welcome! Please login using your account details.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <User2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoComplete="username"
                required
                placeholder="Username"
                className="w-full rounded-xl border-0 bg-[#eceefb] py-3.5 pl-12 pr-4 text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="relative">
              <Locked3 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={passWord}
                onChange={(e) => setPassWord(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="Password"
                className="w-full rounded-xl border-0 bg-[#eceefb] py-3.5 pl-12 pr-4 text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-900 bg-brand-400 py-3.5 text-sm font-semibold text-gray-900 transition hover:bg-brand-500 disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}