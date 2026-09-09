// src/lib/attendance.ts (new file)
import { apiPost } from "@/lib/api-client";
import { ScanResult } from "@/utils/mindaras-api-types";

export function scanTicket(qrCode: string, scannerUser: string) {
  return apiPost<ScanResult, { qrCode: string; scannerUser: string }>("/api/Attendance/Scan", {
    qrCode,
    scannerUser,
  });
}