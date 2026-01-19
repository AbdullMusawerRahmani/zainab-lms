"use server";

import { fetchAPI } from "@/lib/api";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Student } from "@/types/dashboard/student";

const STUDENT_ENDPOINT = "/student/";
const STUDENT_CLASS_FILTER_ENDPOINT = "/student/?class_id=";

// --- Helper to ensure plain objects ---
const sanitizeStudent = (student: Student): Student => ({
  ...student,
  dob: student.dob ? new Date(student.dob).toISOString().split("T")[0] : "",
});

// --- Paginated response type ---
type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// --- Get server-side access token ---
const getToken = async () => {
  const session = await getServerSession(authOptions);
  const token = session?.access;
  if (!token) throw new Error("Not logged in");
  return token;
};

// --- Fetch all students ---
export const fetchStudents = async (): Promise<Student[]> => {
  const token = await getToken();
  const res = await fetchAPI<PaginatedResponse<Student>>(STUDENT_ENDPOINT, {
    method: "GET",
    requiresAuth: true,
    token,
  });

  if (!res.success) throw new Error(res.error || "Failed to fetch students");
  return res.data!.results.map(sanitizeStudent);
};

// --- Fetch students by class ---
export const fetchStudentsByClass = async (classId: string): Promise<Student[]> => {
  const token = await getToken();
  const res = await fetchAPI<PaginatedResponse<Student>>(
    `${STUDENT_CLASS_FILTER_ENDPOINT}${classId}`,
    { method: "GET", requiresAuth: true, token }
  );

  if (!res.success) throw new Error(res.error || "Failed to fetch students for class");
  return res.data!.results.map(sanitizeStudent);
};

// --- Fetch single student by ID ---
export const fetchStudentById = async (id: string): Promise<Student> => {
  const token = await getToken();
  const res = await fetchAPI<Student>(`${STUDENT_ENDPOINT}${id}/`, {
    method: "GET",
    requiresAuth: true,
    token,
  });

  if (!res.success) throw new Error(res.error || "Failed to fetch student");
  return sanitizeStudent(res.data!);
};

// --- Create new student ---
export const createStudent = async (student: Student): Promise<Student> => {
  const token = await getToken();
  const res = await fetchAPI<Student>(STUDENT_ENDPOINT, {
    method: "POST",
    hasFile: true,
    body: student,
    requiresAuth: true,
    token,
  });

  if (!res.success) throw new Error(res.error || "Failed to create student");
  return sanitizeStudent(res.data!);
};

// --- Update student completely (PUT) ---
export const updateStudent = async (id: string, student: Student): Promise<Student> => {
  const token = await getToken();
  const res = await fetchAPI<Student>(`${STUDENT_ENDPOINT}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
    requiresAuth: true,
    token,
  });

  if (!res.success) throw new Error(res.error || "Failed to update student");
  return sanitizeStudent(res.data!);
};

// --- Partial update (PATCH) ---
export const patchStudent = async (id: string, student: Student): Promise<Student> => {
  const token = await getToken();
  const res = await fetchAPI<Student>(`${STUDENT_ENDPOINT}${id}/`, {
    method: "PATCH",
    hasFile: true,
    body: student,
    requiresAuth: true,
    token,
  });

  if (!res.success) throw new Error(res.error || "Failed to patch student");
  return sanitizeStudent(res.data!);
};

// --- Delete student ---
export const deleteStudent = async (id: string): Promise<void> => {
  const token = await getToken();
  const res = await fetchAPI(`${STUDENT_ENDPOINT}${id}/`, {
    method: "DELETE",
    requiresAuth: true,
    token,
  });

  if (!res.success) throw new Error(res.error || "Failed to delete student");
};
