import type { Metadata } from "next";
import EventsPageClient from "./_components/events-page-client";

export const metadata: Metadata = {
  title: "Events Management",
};

export default function EventsPage() {
  return <EventsPageClient />;
}
