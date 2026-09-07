// src/utils/mindaras-data.ts — update EventItem, keep the rest of the file as-is

export type EventStatus = "Active" | "Draft" | "Completed";

export type EventItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: EventStatus;
  capacity?: number;   // API can return null — no capacity set yet
  registered?: number; // no registration-count endpoint yet
};