"use server";

import { fetchAPI } from "@/lib/api";
import type { Attendance } from "@/types/dashboard/student";

// Base endpoint
const ATTENDANCE_ENDPOINT = "/student/attendance/";
const ATTENDANCE_STUDENT_FILTER = "/student/attendance/?student_id=";

// --- Paginated response type ---
type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// --- Sanitize attendance object ---
const sanitizeAttendance = (a: Attendance): Attendance => ({
  ...a,
  attendance_date: a.attendance_date
    ? new Date(a.attendance_date).toISOString().split("T")[0]
    : "",
});

// ============================================================
// ✅ GET ALL ATTENDANCE RECORDS
// ============================================================
export const fetchAttendances = async (): Promise<Attendance[]> => {
  const res = await fetchAPI<PaginatedResponse<Attendance>>(ATTENDANCE_ENDPOINT, {
    method: "GET",
  });

  console.log("fetchAttendances response:", res);

  if (!res.success) throw new Error(res.error || "Failed to fetch attendance records");

  return res.data!.results.map(sanitizeAttendance);
};

// ✅ Get attendance by student
export const fetchAttendanceByStudent = async (
  studentId: string
): Promise<Attendance[]> => {
  const res = await fetchAPI<PaginatedResponse<Attendance>>(
    `${ATTENDANCE_STUDENT_FILTER}${studentId}`,
    { method: "GET" }
  );

  if (!res.success)
    throw new Error(res.error || "Failed to fetch attendance for student");

  return res.data!.results.map(sanitizeAttendance);
};

// ============================================================
// ✅ GET SINGLE ATTENDANCE BY ID
// ============================================================
export const fetchAttendanceById = async (id: string): Promise<Attendance> => {
  const res = await fetchAPI<Attendance>(`${ATTENDANCE_ENDPOINT}${id}/`, {
    method: "GET",
  });

  console.log("fetchAttendanceById response:", res);

  if (!res.success) throw new Error(res.error || "Failed to fetch attendance record");

  return sanitizeAttendance(res.data!);
};

// ============================================================
// ✅ CREATE ATTENDANCE (POST)
// ============================================================
export const createAttendance = async (attendance: Attendance): Promise<Attendance> => {
  const res = await fetchAPI<Attendance>(ATTENDANCE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attendance),
  });

  console.log("createAttendance response:", res);

  if (!res.success) throw new Error(res.error || "Failed to create attendance record");

  return sanitizeAttendance(res.data!);
};

// ============================================================
// ✅ UPDATE ATTENDANCE COMPLETELY (PUT)
// ============================================================
export const updateAttendance = async (
  id: string,
  attendance: Attendance
): Promise<Attendance> => {
  const res = await fetchAPI<Attendance>(`${ATTENDANCE_ENDPOINT}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attendance),
  });

  console.log("updateAttendance response:", res);

  if (!res.success) throw new Error(res.error || "Failed to update attendance record");

  return sanitizeAttendance(res.data!);
};

// ============================================================
// ✅ PARTIAL UPDATE (PATCH)
// ============================================================
export const patchAttendance = async (
  id: string,
  attendance: any
): Promise<Attendance> => {
  console.log("attendance patch: ", attendance)
  const res = await fetchAPI<Attendance>(`${ATTENDANCE_ENDPOINT}${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attendance),
  });

  console.log("patchAttendance response:", res);

  if (!res.success) throw new Error(res.error || "Failed to patch attendance record");

  return sanitizeAttendance(res.data!);
};

// ============================================================
// ✅ DELETE ATTENDANCE
// ============================================================
export const deleteAttendance = async (id: string): Promise<void> => {
  const res = await fetchAPI(`${ATTENDANCE_ENDPOINT}${id}/`, {
    method: "DELETE",
  });

  console.log("deleteAttendance response:", res);

  if (!res.success) throw new Error(res.error || "Failed to delete attendance record");
};




// src/app/actions/students/attendence-services.ts
export const fetchAttendanceByStudentAndDate = async (
  studentId: string,
  fromDate?: string,
  toDate?: string
): Promise<Attendance[]> => {
  let url = `/student/attendance/?student_id=${studentId}`;
  const query: string[] = [];
  if (fromDate) query.push(`from=${fromDate}`);
  if (toDate) query.push(`to=${toDate}`);
  if (query.length) url += `&${query.join("&")}`;

  const res = await fetchAPI<{ results: Attendance[] }>(url, { method: "GET" });

  if (!res.success) throw new Error(res.error || "Failed to fetch attendance for student");

  return res.data!.results.map((a) => ({
    ...a,
    attendance_date: a.attendance_date ? a.attendance_date.split("T")[0] : "",
  }));
};

