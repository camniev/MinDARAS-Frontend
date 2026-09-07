// src/utils/mindaras-api-types.ts

// payloads for events
export type SaveEventPayload = {
  eventName: string;
  eventCategoryId: string; // GUID
  eventStartDate: string;  // ISO 8601
  eventEndDate: string;    // ISO 8601
  eventLocation?: string;
  description?: string;
  eventCapacity?: number;
  userId: string; // GUID
};

export type ApiEvent = {
  eventId: string;
  eventName: string;
  eventRefNo: string;
  eventStartDate: string; // ISO, no timezone offset
  eventEndDate: string;
  eventCategoryName: string | null;
  description: string | null;
  eventLocation: string | null;
  eventCapacity: number | null;
};

export type SaveEventResponse = {
  message: string;
  eventId: string;
  eventRefNo: string;
};

export type EventCategory = {
  eventCategoryId: string;
  eventCategoryName: string;
};
// end payloads for events

// payloads for form definition and form fields
export type FormFieldPayload = {
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  options?: string; // JSON-stringified array, e.g. '["General","VIP"]' — omitted when empty
};

export type SaveEventFormPayload = {
  eventId: string;
  userId: string;
  formName: string;
  formDescription?: string;
  formFields: FormFieldPayload[];
};

export type SaveEventFormResponse = {
  message: string;
};
// payloads for form definition and form fields