"use client";

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
import { cn } from "@/utils/cn";
import { EVENT_CATEGORIES, EventItem } from "@/utils/event-pulse-data";
import { Plus } from "@tailgrids/icons";
import { useState } from "react";
import { Form } from "react-aria-components";
import { toast } from "sonner";
import { apiPost, ApiError } from "@/lib/api-client";
import { SaveEventPayload, SaveEventResponse } from "@/utils/mindaras-api-types";
import { useRouter } from "next/navigation";
import { Button, buttonStyles } from "@/components/tailgrids/core/button";

const CATEGORY_OPTIONS: { id: string; name: string }[] = [
  { id: "REPLACE-WITH-REAL-GUID-1", name: "Tech Conference" },
  { id: "REPLACE-WITH-REAL-GUID-2", name: "Workshop" },
  { id: "REPLACE-WITH-REAL-GUID-3", name: "Bootcamp" },
];

// TODO: replace with real authenticated user id once auth is wired up
const CURRENT_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

type Props = {
  onCreate: (event: EventItem) => void;
};

export default function CreateEventDialog({ onCreate }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(CATEGORY_OPTIONS[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const title = String(data.get("title") ?? "").trim();
    if (!title) return;

    const date = String(data.get("date") ?? "");
    const time = String(data.get("time") ?? "00:00");
    const startDateTime = date ? new Date(`${date}T${time}:00`).toISOString() : new Date().toISOString();

    const payload: SaveEventPayload = {
      eventName: title,
      eventCategoryId: categoryId,
      eventStartDate: startDateTime,
      eventEndDate: startDateTime, // adjust if you collect an explicit end date/time
      eventLocation: String(data.get("location") ?? ""),
      description: String(data.get("description") ?? ""),
      capacity: Number(data.get("capacity") ?? 0) || undefined,
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

      setIsOpen(false);
      e.currentTarget.reset();

      // hand off straight to building this event's registration form
      router.push(`/form-builder?eventId=${result.eventId}`);
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
        <Backdrop isDismissable>
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
                  <Select value={category} onChange={(val) => setCategory(val as string)} className="w-full" aria-label="Category">
                    <Label>Category</Label>
                    <SelectTrigger className="w-full border-card-border">
                      <SelectValue />
                      <SelectIndicator />
                    </SelectTrigger>
                    <SelectContent className="min-w-(--trigger-width)">
                      {EVENT_CATEGORIES.map((opt) => (
                        <SelectItem key={opt} id={opt} textValue={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <TextField className="gap-1.5">
                  <Label htmlFor="event-date">Date</Label>
                  <Input id="event-date" name="date" type="date" required className="w-full" />
                </TextField>

                <TextField className="gap-1.5">
                  <Label htmlFor="event-time">Time</Label>
                  <Input id="event-time" name="time" type="time" required className="w-full" />
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
                <DialogClose className={cn(buttonStyles({ appearance: "outline", size: "lg", className: "px-3.5 text-sm" }))}>
                  Cancel
                </DialogClose>
                <Button type="submit" size="lg" className="px-3.5 text-sm">
                  Save Event
                </Button>
              </DialogFooter>
            </Form>
          </Dialog>
        </Backdrop>
      </OverlayWrapper>
    </>
  );
}
