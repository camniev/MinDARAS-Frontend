// src/app/(with-layouts)/events/_components/event-card.tsx
"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent, CardFooter } from "@/components/tailgrids/core/card";
import { EventItem } from "@/utils/event-pulse-data";
import { Calendar, MapMarker5, UserMultiple1 } from "@tailgrids/icons";

const STATUS_COLOR: Record<EventItem["status"], "success" | "gray" | "warning"> = {
  Active: "success",
  Draft: "gray",
  Completed: "warning",
};

export default function EventCard({ event }: { event: EventItem }) {
  const hasCapacityData = typeof event.capacity === "number" && typeof event.registered === "number";
  const percentFilled = hasCapacityData
    ? Math.min(100, Math.round((event.registered! / event.capacity!) * 100))
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
        {hasCapacityData ? (
          <div className="flex items-center gap-2">
            <UserMultiple1 className="size-4 text-icon-secondary" />
            <span>
              {event.registered} / {event.capacity} registered ({percentFilled}%)
            </span>
          </div>
        ) : typeof event.capacity === "number" ? (
          <div className="flex items-center gap-2">
            <UserMultiple1 className="size-4 text-icon-secondary" />
            <span>Capacity: {event.capacity}</span>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-card-border p-0 pt-3">
        {hasCapacityData ? (
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-background-gray-secondary_alt">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${percentFilled}%` }} />
          </div>
        ) : (
          <span className="text-[11px] text-text-tertiary">{event.eventRefNoLabel ?? ""}</span>
        )}
        <Button
          variant="ghost"
          appearance="ghost"
          size="sm"
          className="px-2 text-brand-500 hover:bg-transparent hover:text-brand-600"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}