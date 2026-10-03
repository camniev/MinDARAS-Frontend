// (with-layouts)/(dashboard)/(home)/page.tsx
import type { Metadata } from "next";
import DashboardPageClient from "./_component/dashboard-page-client";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function HomePage() {
  return <DashboardPageClient />;
}