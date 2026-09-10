// src/utils/map-api-event.ts — export deriveStatus so create-event-dialog can reuse it
import { ApiEvent } from "@/utils/mindaras-api-types";
import { EventItem, EventStatus } from "./mindaras-data";

export function deriveStatus(startIso: string, endIso: string): EventStatus {
  const now = Date.now();
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  if (now < start) return "Upcoming";
  if (now <= end) return "Ongoing";
  return "Completed"; // event's end date has passed
}

function formatDateTime(startIso: string) {
  const start = new Date(startIso);
  const isMidnight = start.getHours() === 0 && start.getMinutes() === 0;

  const date = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const time = isMidnight
    ? "All day"
    : start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return { date, time };
}

export function mapApiEventToEventItem(apiEvent: ApiEvent): EventItem {
  const { date, time } = formatDateTime(apiEvent.eventStartDate);

  return {
    id: apiEvent.eventId,
    category: apiEvent.eventCategoryName ?? "Uncategorized",
    title: apiEvent.eventName,
    description: apiEvent.description ?? "No description provided.",
    date,
    time,
    location: apiEvent.eventLocation ?? "TBD",
    status: deriveStatus(apiEvent.eventStartDate, apiEvent.eventEndDate),
    capacity: apiEvent.eventCapacity ?? undefined,
    registered: apiEvent.registrationCount,
    checkedIn: apiEvent.checkedInCount,
  };
}