// src/app/(with-layouts)/events/[eventId]/_components/event-detail-page-client.tsx
"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent, CardHeader } from "@/components/tailgrids/core/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { ApiError } from "@/lib/api-client";
import { fetchEventById, fetchRegistrationsForEvent } from "@/lib/events";
import { cn } from "@/utils/cn";
import { EventDetail, RegistrationListItem } from "@/utils/mindaras-api-types";
import {
  Calendar,
  CheckCircle1,
  ClockThree,
  MapMarker5,
  Copy1,
  UserMultiple1,
} from "@tailgrids/icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function EventDetailPageClient({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [eventData, regData] = await Promise.all([
          fetchEventById(eventId),
          fetchRegistrationsForEvent(eventId),
        ]);
        if (cancelled) return;
        setEvent(eventData);
        setRegistrations(regData);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : "Couldn't load this event.";
        setLoadError(message);
        toast.error("Couldn't load event", { description: message });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  async function handleCopyRegistrationLink() {
    const link = `${window.location.origin}/register/${event!.eventId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Registration link copied", { description: link });
    } catch {
      toast.error("Couldn't copy the link", {
        description: "Your browser blocked clipboard access — copy it manually instead.",
      });
    }
  }

  const stats = useMemo(() => {
    const checkedIn = registrations.filter((r) => r.checkInTime).length;
    return {
      total: registrations.length,
      checkedIn,
      pending: registrations.length - checkedIn,
    };
  }, [registrations]);

  if (isLoading) {
    return (
      <div className="mt-6 space-y-5 px-2 lg:px-6">
        <Card className="h-24 animate-pulse bg-background-gray-secondary_alt" />
        <Card className="h-64 animate-pulse bg-background-gray-secondary_alt" />
      </div>
    );
  }

  if (loadError || !event) {
    return (
      <div className="mt-6 px-2 lg:px-6">
        <Card className="space-y-3 py-12 text-center">
          <p className="text-sm text-text-tertiary">{loadError ?? "Event not found."}</p>
          <Link href="/events" className="text-sm font-medium text-brand-500 hover:underline">
            Back to Events
          </Link>
        </Card>
      </div>
    );
  }

  const hasForm = Boolean(event.formId);

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-[28px] leading-8 font-medium text-text-primary">{event.eventName}</h1>
            {event.eventCategoryName && (
              <Badge color="blue" size="sm">
                {event.eventCategoryName}
              </Badge>
            )}
          </div>
          <p className="font-mono text-xs text-text-tertiary">{event.eventRefNo}</p>
        </div>

        <Breadcrumbs
          dividerType="chevron"
          items={[
            { href: "/", label: "Home" },
            { href: "/events", label: "Events" },
            { href: `/events/${event.eventId}`, label: event.eventName },
          ]}
        />
      </div>

      <div className="space-y-5 px-2 lg:px-6">
        <Card className="space-y-3 p-5">
          {event.description && <p className="text-sm text-text-secondary">{event.description}</p>}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-tertiary">
            <span className="flex items-center gap-2">
              <Calendar className="size-4 text-icon-secondary" />
              {new Date(event.eventStartDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {" – "}
              {new Date(event.eventEndDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {event.eventLocation && (
              <span className="flex items-center gap-2">
                <MapMarker5 className="size-4 text-icon-secondary" />
                {event.eventLocation}
              </span>
            )}
            {typeof event.eventCapacity === "number" && (
              <span className="flex items-center gap-2">
                <UserMultiple1 className="size-4 text-icon-secondary" />
                Capacity: {event.eventCapacity}
              </span>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { id: "total", title: "Registered", value: stats.total, icon: <UserMultiple1 />, bg: "bg-badge-blue-background", fg: "text-badge-blue-icon-color" },
              { id: "checked-in", title: "Checked-In", value: stats.checkedIn, icon: <CheckCircle1 />, bg: "bg-badge-success-background", fg: "text-badge-success-icon-color" },
              { id: "pending", title: "Pending", value: stats.pending, icon: <ClockThree />, bg: "bg-badge-warning-background", fg: "text-badge-warning-icon-color" },
            ].map((s) => (
              <Card key={s.id}>
                <CardHeader>
                  <div className={cn("flex size-8 items-center justify-center rounded-lg [&>svg]:size-4.5", s.bg, s.fg)}>
                    {s.icon}
                  </div>
                </CardHeader>
                <CardContent className="mt-4 p-0">
                  <div className="mb-1 text-2xl leading-8 font-semibold text-text-primary">{s.value}</div>
                  <span className="text-sm leading-5 font-medium text-text-tertiary">{s.title}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {hasForm && (
            <Button appearance="outline" className="gap-2 px-4" onClick={handleCopyRegistrationLink}>
              <Copy1 className="size-4" />
              Copy Registration Link
            </Button>
          )}
          <Button asChild className="gap-2 px-4">
            <Link href={`/form-builder?eventId=${event.eventId}`}>
              {hasForm ? "Edit Registration Form" : "Create a Form"}
            </Link>
          </Button>
        </div>

        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            <TableRoot className="w-full rounded-none border-none">
              <TableHeader>
                <TableRow className="bg-background-gray-secondary_alt">
                  <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                    Participant Code
                  </TableHead>
                  <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                    Registered
                  </TableHead>
                  <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                    Check-in Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.length === 0 ? (
                  <TableRow>
                    <TableCell className="p-6 text-center text-sm text-text-tertiary" colSpan={4}>
                      {hasForm
                        ? "No one has registered for this event yet."
                        : "Create a registration form to start collecting sign-ups."}
                    </TableCell>
                  </TableRow>
                ) : (
                  registrations.map((r) => (
                    <TableRow key={r.registrationId} className="[&_td]:border-none">
                      <TableCell className="h-14 px-6 py-3 font-mono text-xs text-text-tertiary">
                        {r.participantCode}
                      </TableCell>
                      <TableCell className="h-14 px-6 py-3 text-sm text-text-secondary">
                        {new Date(r.registrationDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="h-14 px-6 py-3">
                        <Badge color={r.checkInTime ? "success" : "warning"} size="sm">
                          {r.checkInTime ? "Checked-In" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-14 px-6 py-3 text-xs text-text-tertiary">
                        {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "--"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </TableRoot>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}