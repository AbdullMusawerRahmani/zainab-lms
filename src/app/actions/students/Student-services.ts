"use server";


import { fetchAPI } from "@/lib/api";
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

// --- Fetch all students ---
export const fetchStudents = async (): Promise<Student[]> => {
  const res = await fetchAPI<PaginatedResponse<Student>>(STUDENT_ENDPOINT, { method: "GET" });

  console.log("fetchStudents response:", res); // <-- debug

  if (!res.success) throw new Error(res.error || "Failed to fetch students");

  // Map over results array
  return res.data!.results.map(sanitizeStudent);
};

// --- Fetch students by class ---
export const fetchStudentsByClass = async (classId: string): Promise<Student[]> => {
  const res = await fetchAPI<PaginatedResponse<Student>>(
    `${STUDENT_CLASS_FILTER_ENDPOINT}${classId}`,
    { method: "GET" }
  );

  if (!res.success) throw new Error(res.error || "Failed to fetch students for class");

  return res.data!.results.map(sanitizeStudent);
};

// --- Fetch single student by ID ---
export const fetchStudentById = async (id: string): Promise<Student> => {
  const res = await fetchAPI<Student>(`${STUDENT_ENDPOINT}${id}/`, { method: "GET" });

  console.log("fetchStudentById response:", res);

  if (!res.success) throw new Error(res.error || "Failed to fetch student");

  return sanitizeStudent(res.data!);
};


// --- Create new student ---
export const createStudent = async (student: Student): Promise<Student> => {
  const res = await fetchAPI<Student>(STUDENT_ENDPOINT, {
    method: "POST",
    hasFile: true,
    body: student, 
  });

  console.log("createStudent response:", res);

  if (!res.success) throw new Error(res.error || "Failed to create student");

  return sanitizeStudent(res.data!);
};

// --- Update student completely (PUT) ---
export const updateStudent = async (id: string, student: Student): Promise<Student> => {
  const res = await fetchAPI<Student>(`${STUDENT_ENDPOINT}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });

  console.log("updateStudent response:", res);

  if (!res.success) throw new Error(res.error || "Failed to update student");

  return sanitizeStudent(res.data!);
};

// --- Partial update (PATCH) ---
// --- Partial update (PATCH) with FormData ---
export const patchStudent = async (id: string, student: Student): Promise<Student> => {
  const res = await fetchAPI<Student>(`${STUDENT_ENDPOINT}${id}/`, {
    method: "PATCH",
    hasFile: true, // allow sending FormData
    body: student,  // FormData object directly
  });

  console.log("patchStudent response:", res);

  if (!res.success) throw new Error(res.error || "Failed to patch student");

  return sanitizeStudent(res.data!);
};


// --- Delete student ---
export const deleteStudent = async (id: string): Promise<void> => {
  const res = await fetchAPI(`${STUDENT_ENDPOINT}${id}/`, { method: "DELETE" });

  console.log("deleteStudent response:", res);

  if (!res.success) throw new Error(res.error || "Failed to delete student");
};
