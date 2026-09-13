// src/app/(public)/first-login-password/page.tsx
import type { Metadata } from "next";
import FirstLoginPasswordClient from "./_components/first-login-password-client";

export const metadata: Metadata = {
  title: "Set Your Password",
};

export default function FirstLoginPasswordPage() {
  return <FirstLoginPasswordClient />;
}