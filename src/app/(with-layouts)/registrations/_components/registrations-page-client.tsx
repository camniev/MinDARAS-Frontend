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
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { cn } from "@/utils/cn";
import { INITIAL_EVENTS, INITIAL_REGISTRATIONS, Registration } from "@/utils/event-pulse-data";
import { CheckCircle1, ClockThree, Download1, Search1, UserMultiple1 } from "@tailgrids/icons";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function RegistrationsPageClient() {
  const [registrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      const matchesEvent = eventFilter === "all" || r.eventId === eventFilter;
      const matchesSearch =
        !search ||
        r.attendee.toLowerCase().includes(search.toLowerCase()) ||
        r.ticketCode.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase());
      return matchesEvent && matchesSearch;
    });
  }, [registrations, search, eventFilter]);

  const stats = useMemo(() => {
    const checkedIn = registrations.filter((r) => r.status === "Checked-In").length;
    return [
      {
        id: "total",
        title: "Total Registrations",
        value: registrations.length,
        icon: <UserMultiple1 />,
        iconBgClass: "bg-badge-blue-background",
        iconColorClass: "text-badge-blue-icon-color",
      },
      {
        id: "checked-in",
        title: "Checked-In",
        value: checkedIn,
        icon: <CheckCircle1 />,
        iconBgClass: "bg-badge-success-background",
        iconColorClass: "text-badge-success-icon-color",
      },
      {
        id: "pending",
        title: "Pending",
        value: registrations.length - checkedIn,
        icon: <ClockThree />,
        iconBgClass: "bg-badge-warning-background",
        iconColorClass: "text-badge-warning-icon-color",
      },
    ];
  }, [registrations]);

  function handleExport() {
    const header = "Attendee,Email,Event,Ticket Code,Status,Check-in Time\n";
    const rows = filtered
      .map((r) =>
        [r.attendee, r.email, r.eventTitle, r.ticketCode, r.status, r.checkInTime ?? ""].join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export ready", { description: `${filtered.length} rows exported to CSV.` });
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
        <div>
          <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">
            Registration List
          </h1>
          <p className="text-sm leading-5 text-text-tertiary">
            Monitor attendee registrations and real-time check-ins.
          </p>
        </div>

        <Breadcrumbs
          dividerType="chevron"
          items={[
            { href: "/", label: "Home" },
            { href: "/registrations", label: "Registration List" },
          ]}
        />
      </div>

      <div className="space-y-5 px-2 lg:px-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg [&>svg]:size-4.5",
                    item.iconBgClass,
                    item.iconColorClass,
                  )}
                >
                  {item.icon}
                </div>
              </CardHeader>
              <CardContent className="mt-4 p-0">
                <div className="mb-1 text-2xl leading-8 font-semibold text-text-primary">
                  {item.value}
                </div>
                <span className="text-sm leading-5 font-medium text-text-tertiary">{item.title}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <InputGroup className="w-full sm:max-w-70">
              <InputGroupAddon align="inline-start" className="pr-1 text-text-secondary">
                <Search1 />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search attendee, email or ticket…"
                className="text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>

            <Select
              value={eventFilter}
              onChange={(val) => setEventFilter(val as string)}
              className="w-full sm:w-56"
              aria-label="Filter by event"
            >
              <SelectTrigger className="w-full border-card-border">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent className="min-w-(--trigger-width)">
                <SelectItem id="all" textValue="All Events">
                  All Events
                </SelectItem>
                {INITIAL_EVENTS.map((event) => (
                  <SelectItem key={event.id} id={event.id} textValue={event.title}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button appearance="outline" className="gap-2 px-4 whitespace-nowrap" onClick={handleExport}>
            <Download1 className="size-4" />
            Export
          </Button>
        </div>

        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            <TableRoot className="w-full rounded-none border-none">
              <TableHeader>
                <TableRow className="bg-background-gray-secondary_alt">
                  <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                    Attendee
                  </TableHead>
                  <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                    Event
                  </TableHead>
                  <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                    Ticket Code
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
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell className="p-6 text-center text-sm text-text-tertiary" colSpan={5}>
                      No registrations match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id} className="[&_td]:border-none">
                      <TableCell className="h-16 px-6 py-3 text-sm leading-5 font-medium text-text-primary">
                        <div>{r.attendee}</div>
                        <div className="text-xs font-normal text-text-tertiary">{r.email}</div>
                      </TableCell>
                      <TableCell className="h-16 px-6 py-3 text-sm leading-5 text-text-secondary">
                        {r.eventTitle}
                      </TableCell>
                      <TableCell className="h-16 px-6 py-3 font-mono text-xs text-text-tertiary">
                        {r.ticketCode}
                      </TableCell>
                      <TableCell className="h-16 px-6 py-3">
                        <Badge color={r.status === "Checked-In" ? "success" : "warning"} size="sm">
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-16 px-6 py-3 text-xs text-text-tertiary">
                        {r.checkInTime ?? "--"}
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
