import { apiGet, apiPut } from "@/lib/api-client";
import {
  ChangePasswordPayload,
  DivisionOffice,
  UpdateUserProfilePayload,
  UserProfile,
  UserType,
} from "@/utils/mindaras-api-types";

// Real endpoints, as given.
export function fetchActiveDivisions() {
  return apiGet<DivisionOffice[]>("/api/Division/FetchActiveDivisions");
}

export function fetchActiveUserTypes() {
  return apiGet<UserType[]>("/api/User/GetActiveUserTypes");
}

// Proposed endpoints — confirm against your actual backend before relying on these.
export function fetchUserProfile(userId: string) {
  return apiGet<UserProfile>(`/api/User/GetUserById/${userId}`);
}

export function updateUserProfile(userId: string, payload: UpdateUserProfilePayload) {
  return apiPut<{ message: string }, UpdateUserProfilePayload>(`/api/User/${userId}`, payload);
}

export function changePassword(userId: string, payload: ChangePasswordPayload) {
  return apiPut<{ message: string }, ChangePasswordPayload>(
    `/api/User/${userId}/ChangePassword`,
    payload,
  );
}