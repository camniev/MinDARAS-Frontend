import type { Metadata } from "next";
import EventDetailPageClient from "./_components/event-detail-page-client";

export const metadata: Metadata = {
  title: "Events Management",
};

export default async function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolved = await params;
  console.log("resolved params:", resolved); // check your terminal (server-side log), not browser console
  const { eventId } = resolved;
  return <EventDetailPageClient eventId={eventId} />;
}