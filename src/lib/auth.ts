// src/lib/auth.ts
import { apiPost, apiPut } from "@/lib/api-client";

export type LoginPayload = {
  userName: string;
  passWord: string;
};

export type LoginResponse = {
  accessToken: string;
};

export function login(payload: LoginPayload) {
  return apiPost<LoginResponse, LoginPayload>("/api/Auth/Login", payload, { credentials: "include" });
}

export function refreshAccessToken() {
  return apiPost<LoginResponse, undefined>("/api/Auth/refresh-token", undefined, {
    credentials: "include",
  });
}

export function logout() {
  return apiPost<void, undefined>("/api/Auth/Logout", undefined, { credentials: "include" });
}

export function updatePasswordOnFirstLogin(
  userId: string,
  payload: { currentPassword: string; newPassword: string },
) {
  return apiPut<{ message: string }, typeof payload>(
    `/api/Auth/${userId}/UpdatePasswordOnFirstLogin`,
    payload,
    { credentials: "include" },
  );
}