// src/lib/decode-token.ts
import { jwtDecode } from "jwt-decode";
import { DecodedAccessToken } from "@/utils/mindaras-api-types";

export function decodeAccessToken(token: string): DecodedAccessToken | null {
  try {
    return jwtDecode<DecodedAccessToken>(token);
  } catch {
    return null;
  }
}

export function isTokenExpired(decoded: DecodedAccessToken): boolean {
  return Date.now() >= decoded.exp * 1000;
}