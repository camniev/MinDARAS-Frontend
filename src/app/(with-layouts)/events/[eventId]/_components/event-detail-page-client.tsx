"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent, CardHeader } from "@/components/tailgrids/core/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { ApiError } from "@/lib/api-client";
import { fetchEventById, fetchFormForEvent, fetchRegistrationsForEvent } from "@/lib/events";
import { cn } from "@/utils/cn";
import {
  EventDetail,
  FormDefinitionDetail,
  RegistrationListItem,
} from "@/utils/mindaras-api-types";
import {
  Calendar,
  CheckCircle1,
  ClockThree,
  Copy1,
  Download1,
  MapMarker5,
  Plus,
  Search1,
  UserMultiple1,
  PenToSquare,
} from "@tailgrids/icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// fieldNames these are hardcoded to under DEFAULT_BUILDER_FIELDS — always pinned first
const NAME_FIELD_NAME = "full_name";
const EMAIL_FIELD_NAME = "email";

function getResponseValue(reg: RegistrationListItem, fieldId: string): string {
  return reg.responses.find((r) => r.fieldId === fieldId)?.fieldValue ?? "";
}

export default function EventDetailPageClient({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [form, setForm] = useState<FormDefinitionDetail | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [eventData, formData, regData] = await Promise.all([
          fetchEventById(eventId),
          fetchFormForEvent(eventId),
          fetchRegistrationsForEvent(eventId),
        ]);
        if (cancelled) return;
        setEvent(eventData);
        setForm(formData);
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

  // Name + Email always lead; remaining fields follow in OrderIndex order.
  const nameField = form?.formFields.find((f) => f.fieldName === NAME_FIELD_NAME);
  const emailField = form?.formFields.find((f) => f.fieldName === EMAIL_FIELD_NAME);
  const extraFields = useMemo(
    () =>
      (form?.formFields ?? [])
        .filter((f) => f.fieldName !== NAME_FIELD_NAME && f.fieldName !== EMAIL_FIELD_NAME)
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [form],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return registrations;
    const term = search.toLowerCase();
    return registrations.filter((r) => {
      const haystack = [
        r.participantCode,
        ...r.responses.map((resp) => resp.fieldValue),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [registrations, search]);

  const stats = useMemo(() => {
    const checkedIn = registrations.filter((r) => r.checkInTime).length;
    return {
      total: registrations.length,
      checkedIn,
      pending: registrations.length - checkedIn,
    };
  }, [registrations]);

  function handleExport() {
    const columns = [
      "Participant Code",
      nameField?.fieldLabel ?? "Name",
      emailField?.fieldLabel ?? "Email",
      ...extraFields.map((f) => f.fieldLabel),
      "Status",
      "Check-in Time",
    ];

    const rows = filtered.map((r) => {
      const cells = [
        r.participantCode,
        nameField ? getResponseValue(r, nameField.fieldId) : "",
        emailField ? getResponseValue(r, emailField.fieldId) : "",
        ...extraFields.map((f) => getResponseValue(r, f.fieldId)),
        r.checkInTime ? "Checked-In" : "Pending",
        r.checkInTime ?? "",
      ];
      // escape commas/quotes so CSV doesn't break on free-text answers
      return cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
    });

    const csv = [columns.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event?.eventRefNo ?? "event"}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export ready", { description: `${filtered.length} rows exported to CSV.` });
  }

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

  const hasForm = Boolean(form);

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
          <div className="flex flex-wrap items-center justify-between gap-4">
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

            {/* form actions live here, next to the event's own metadata —
                not floating above the table where they compete with search/export */}
            <div className="flex flex-wrap gap-3">
              {hasForm && (
                <Button appearance="outline" size="sm" className="gap-2 px-3.5" onClick={handleCopyRegistrationLink}>
                  <Copy1 className="size-4" />
                  Copy Registration Link
                </Button>
              )}
              <Button asChild size="sm" className="gap-2 px-3.5">
                {hasForm ? <PenToSquare className="size-4" /> : <Plus className="size-4" />}
                <Link href={`/form-builder?eventId=${event.eventId}`}>
                  {hasForm ? "Edit Registration Form" : "Create a Form"}
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <InputGroup className="w-full sm:max-w-70">
            <InputGroupAddon align="inline-start" className="pr-1 text-text-secondary">
              <Search1 />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search name, email, ticket code…"
              className="text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <Button
            appearance="outline"
            className="gap-2 px-4 whitespace-nowrap"
            onClick={handleExport}
            isDisabled={filtered.length === 0}
          >
            <Download1 className="size-4" />
            Export
          </Button>
        </div>

        <Card className="overflow-hidden p-0">
          <CardContent className="overflow-x-auto p-0">
            <TableRoot className="w-full min-w-max rounded-none border-none">
              <TableHeader>
                <TableRow className="bg-background-gray-secondary_alt">
                  <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                    {nameField?.fieldLabel ?? "Name"}
                  </TableHead>
                  <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                    {emailField?.fieldLabel ?? "Email"}
                  </TableHead>
                  {extraFields.map((f) => (
                    <TableHead
                      key={f.fieldId}
                      className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary"
                    >
                      {f.fieldLabel}
                    </TableHead>
                  ))}
                  <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                    Check-in Time
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="p-6 text-center text-sm text-text-tertiary"
                      colSpan={4 + extraFields.length}
                    >
                      {!hasForm
                        ? "Create a registration form to start collecting sign-ups."
                        : registrations.length === 0
                          ? "No one has registered for this event yet."
                          : "No registrations match your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.registrationId} className="[&_td]:border-none">
                      <TableCell className="h-14 px-6 py-3 text-sm leading-5 font-medium text-text-primary">
                        {nameField ? getResponseValue(r, nameField.fieldId) : "—"}
                        <div className="font-mono text-[11px] font-normal text-text-tertiary">
                          {r.participantCode}
                        </div>
                      </TableCell>
                      <TableCell className="h-14 px-6 py-3 text-sm text-text-secondary">
                        {emailField ? getResponseValue(r, emailField.fieldId) : "—"}
                      </TableCell>
                      {extraFields.map((f) => (
                        <TableCell key={f.fieldId} className="h-14 px-6 py-3 text-sm text-text-secondary">
                          {getResponseValue(r, f.fieldId) || "—"}
                        </TableCell>
                      ))}
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