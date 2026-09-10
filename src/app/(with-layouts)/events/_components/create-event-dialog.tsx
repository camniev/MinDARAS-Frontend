"use client";

import { Button, buttonStyles } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { FieldError } from "@/components/tailgrids/core/field";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { Backdrop, OverlayWrapper } from "@/components/tailgrids/core/overlay";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { TextField } from "@/components/tailgrids/core/text-field";
import { apiPost, ApiError } from "@/lib/api-client";
import { fetchEventCategories } from "@/lib/event-categories";
import { cn } from "@/utils/cn";
import { EventItem } from "@/utils/mindaras-data";
import { EventCategory, SaveEventPayload, SaveEventResponse } from "@/utils/mindaras-api-types";
import { Plus } from "@tailgrids/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Form } from "react-aria-components";
import { toast } from "sonner";
import { deriveStatus } from "@/utils/map-api-event";

// TODO: replace with real authenticated user id once auth is wired up
const CURRENT_USER_ID = "C035AF19-1469-4EC9-84C3-5E095B8602B0";

type Props = {
  onCreate: (event: EventItem) => void;
};

export default function CreateEventDialog({ onCreate }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [eventCategoryId, setEventCategoryId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEventCategories()
      .then((fetched) => {
        setCategories(fetched);
        // default to the first category once loaded, so submitting without
        // touching the dropdown still sends a valid id
        setEventCategoryId((current) => current || fetched[0]?.eventCategoryId || "");
      })
      .catch(() => toast.error("Couldn't load event categories"));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const title = String(data.get("title") ?? "").trim();
    if (!title) return;

    if (!eventCategoryId) {
      toast.error("Please select a category.");
      return;
    }

    const startDate = String(data.get("date") ?? "");
    const startTime = String(data.get("time") ?? "00:00");
    const endDateRaw = String(data.get("endDate") ?? "") || startDate;
    const endTimeRaw = String(data.get("endTime") ?? "") || startTime;

    const startDateTime = startDate
      ? new Date(`${startDate}T${startTime}:00`).toISOString()
      : new Date().toISOString();
    const endDateTime = endDateRaw
      ? new Date(`${endDateRaw}T${endTimeRaw}:00`).toISOString()
      : startDateTime;

    const location = String(data.get("location") ?? "");
    const description = String(data.get("description") ?? "");
    const capacityRaw = Number(data.get("capacity") ?? 0) || undefined;

    const payload: SaveEventPayload = {
      eventName: title,
      eventCategoryId: eventCategoryId,
      eventStartDate: startDateTime,
      eventEndDate: endDateTime,
      eventLocation: location,
      description,
      eventCapacity: capacityRaw,
      userId: CURRENT_USER_ID,
    };

    setIsSubmitting(true);
    try {
      const result = await apiPost<SaveEventResponse, SaveEventPayload>(
        "/api/Event/SaveEvents",
        payload,
      );

      toast.success("Event created", {
        description: `"${title}" (${result.eventRefNo}) was saved.`,
      });

      // optimistically reflect the new event in the grid before navigating
      const categoryName = categories.find((c) => c.eventCategoryId === eventCategoryId)?.eventCategoryName ?? "Uncategorized";
      onCreate({
      id: result.eventId,
      category: categoryName,
      title,
      description,
      date: startDate
        ? new Date(`${startDate}T00:00:00`).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "TBD",
      time: startTime || "TBD",
      location: location || "TBD",
      status: deriveStatus(startDateTime, endDateTime), // ← was: "Draft"
      capacity: capacityRaw,
      registered: 0,
      checkedIn: 0,
    });

      setIsOpen(false);
      e.currentTarget.reset();

      // hand off straight to building this event's registration form
      router.push(`/events`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong.";
      toast.error("Couldn't create event", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2 px-4">
        <Plus className="size-4" />
        Create Event
      </Button>

      <OverlayWrapper isOpen={isOpen} onOpenChange={setIsOpen}>
        <Backdrop isDismissable={!isSubmitting}>
          <Dialog className="max-w-135 p-0">
            <Form onSubmit={handleSubmit}>
              <DialogHeader className="gap-1 border-b border-card-border py-4 pr-14 pl-5">
                <DialogTitle className="text-xl leading-7">Create New Event</DialogTitle>
                <DialogDescription className="text-text-tertiary">
                  Fill in the details below to publish a new event.
                </DialogDescription>
              </DialogHeader>

              <DialogBody className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
                <TextField className="col-span-1 gap-1.5 sm:col-span-2">
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input id="event-title" name="title" placeholder="Tech Summit 2026" required className="w-full" />
                  <FieldError />
                </TextField>

                <div className="col-span-1 flex flex-col gap-1.5 sm:col-span-2">
                  <Select
                    value={eventCategoryId}
                    onChange={(val) => setEventCategoryId(val as string)}
                    className="w-full"
                    aria-label="Category"
                    isDisabled={categories.length === 0}
                  >
                    <Label>Category</Label>
                    <SelectTrigger className="w-full border-card-border">
                      <SelectValue placeholder={categories.length === 0 ? "Loading categories…" : undefined} />
                      <SelectIndicator />
                    </SelectTrigger>
                    <SelectContent className="min-w-(--trigger-width)">
                      {categories.map((cat) => (
                        <SelectItem key={cat.eventCategoryId} id={cat.eventCategoryId} textValue={cat.eventCategoryName}>
                          {cat.eventCategoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <TextField className="gap-1.5">
                  <Label htmlFor="event-date">Start Date</Label>
                  <Input id="event-date" name="date" type="date" required className="w-full" />
                </TextField>

                <TextField className="gap-1.5">
                  <Label htmlFor="event-time">Start Time</Label>
                  <Input id="event-time" name="time" type="time" required className="w-full" />
                </TextField>

                <TextField className="gap-1.5">
                  <Label htmlFor="event-end-date">End Date</Label>
                  <Input id="event-end-date" name="endDate" type="date" className="w-full" />
                </TextField>

                <TextField className="gap-1.5">
                  <Label htmlFor="event-end-time">End Time</Label>
                  <Input id="event-end-time" name="endTime" type="time" className="w-full" />
                </TextField>

                <TextField className="gap-1.5">
                  <Label htmlFor="event-location">Location</Label>
                  <Input id="event-location" name="location" placeholder="Grand Convention Hall" className="w-full" />
                </TextField>

                <TextField className="gap-1.5">
                  <Label htmlFor="event-capacity">Capacity</Label>
                  <Input id="event-capacity" name="capacity" type="number" min={1} placeholder="200" className="w-full" />
                </TextField>

                <TextField className="col-span-1 gap-1.5 sm:col-span-2">
                  <Label htmlFor="event-description">Description</Label>
                  <TextArea id="event-description" name="description" rows={3} placeholder="What is this event about?" />
                </TextField>
              </DialogBody>

              <DialogFooter className="border-t border-card-border px-5 py-4">
                <DialogClose
                  isDisabled={isSubmitting}
                  className={cn(buttonStyles({ appearance: "outline", size: "lg", className: "px-3.5 text-sm" }))}
                >
                  Cancel
                </DialogClose>
                <Button type="submit" size="lg" className="px-3.5 text-sm" isDisabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Save Event"}
                </Button>
              </DialogFooter>
            </Form>
          </Dialog>
        </Backdrop>
      </OverlayWrapper>
    </>
  );
}