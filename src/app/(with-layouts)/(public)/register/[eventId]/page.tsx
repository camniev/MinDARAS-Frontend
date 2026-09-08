// src/app/(public)/register/[eventId]/page.tsx
import type { Metadata } from "next";
import RegisterPageClient from "./_components/register-page-client";

export const metadata: Metadata = {
  title: "Event Registration",
};

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <RegisterPageClient eventId={eventId} />;
}