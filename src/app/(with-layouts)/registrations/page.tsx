import type { Metadata } from "next";
import RegistrationsPageClient from "./_components/registrations-page-client";

export const metadata: Metadata = {
  title: "Registration List",
};

export default function RegistrationsPage() {
  return <RegistrationsPageClient />;
}
