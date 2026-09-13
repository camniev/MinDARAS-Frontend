// src/app/(public)/login/page.tsx
import type { Metadata } from "next";
import LoginPageClient from "./_components/login-page-client";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return <LoginPageClient />;
}