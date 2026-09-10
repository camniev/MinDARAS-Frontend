// src/app/(with-layouts)/events/_components/event-card.tsx
"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent, CardFooter } from "@/components/tailgrids/core/card";
import { EventItem } from "@/utils/mindaras-data";
import { Calendar, MapMarker5, UserMultiple1 } from "@tailgrids/icons";
import Link from "next/link";

const STATUS_COLOR: Record<EventItem["status"], "success" | "gray" | "warning" | "blue"> = {
  Upcoming: "blue",
  Ongoing: "success",
  Completed: "gray",
};

export default function EventCard({ event }: { event: EventItem }) {
  const hasCapacity = typeof event.capacity === "number" && event.capacity > 0;
  const registeredCount = event.registered ?? 0;
  const checkedInCount = event.checkedIn ?? 0;

  const registeredPercent = hasCapacity
    ? Math.min(100, Math.round((registeredCount / event.capacity!) * 100))
    : null;
  const checkedInPercent = registeredCount > 0
    ? Math.min(100, Math.round((checkedInCount / registeredCount) * 100))
    : null;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-2">
        <Badge color="blue" size="sm">
          {event.category}
        </Badge>
        <Badge color={STATUS_COLOR[event.status]} size="sm">
          {event.status}
        </Badge>
      </div>

      <div>
        <h3 className="text-lg leading-6 font-semibold text-text-primary">{event.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-text-tertiary">
          {event.description}
        </p>
      </div>

      <CardContent className="space-y-2 border-t border-card-border p-0 pt-3 text-xs leading-4 text-text-secondary">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-icon-secondary" />
          <span>
            {event.date} &bull; {event.time}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapMarker5 className="size-4 text-icon-secondary" />
          <span>{event.location}</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-card-border p-0 pt-3">
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <UserMultiple1 className="size-3.5 text-icon-secondary" />
              Registered
            </span>
            <span>
              {registeredCount}
              {hasCapacity ? ` / ${event.capacity}` : ""}
            </span>
          </div>
          {hasCapacity && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-gray-secondary_alt">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${registeredPercent}%` }} />
            </div>
          )}
        </div>

        {registeredCount > 0 && (
          <div className="w-full space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Checked-in</span>
              <span>
                {checkedInCount} / {registeredCount}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-gray-secondary_alt">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${checkedInPercent}%` }}
              />
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          appearance="ghost"
          size="sm"
          className="w-full justify-center px-2 text-brand-500 hover:bg-transparent hover:text-brand-600"
        >
          <Link href={`/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}