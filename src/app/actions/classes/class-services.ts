"use server";
import { fetchAPI } from "@/lib/api";
import type { ClassItem } from "@/types/dashboard/class";

const CLASS_ENDPOINT = "/student/class/";

// --- Helper (kept for consistency, no date formatting needed) ---
const sanitizeClass = (cls: ClassItem): ClassItem => ({
  ...cls,
});

// --- Paginated response type ---
type PaginatedResponse<T> = {
  count: number;    
    next: string | null;
    previous: string | null;
    results: T[];
};

// --- Fetch all classes ---
export const fetchClasses = async (): Promise<ClassItem[]> => {
    const res = await fetchAPI<PaginatedResponse<ClassItem>>(CLASS_ENDPOINT, {
         method: "GET",
         });
    console.log("fetchClasses response:", res); 

    if (!res.success) throw new Error(res.error || "Failed to fetch classes");
    return res.data!.results.map(sanitizeClass);
};

// --- Fetch class by ID ---
export const fetchClassById = async (id: string): Promise<ClassItem> => {
  const res = await fetchAPI<ClassItem>(`${CLASS_ENDPOINT}${id}/`, {
    method: "GET",
  });

  console.log("fetchClassById response:", res);

  if (!res.success) throw new Error(res.error || "Failed to fetch class");

  return sanitizeClass(res.data!);
};

// --- Create a new class ---
export const createClass = async (cls: ClassItem): Promise<ClassItem> => {
  const res = await fetchAPI<ClassItem>(CLASS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cls),
  });

  console.log("createClass response:", res);

  if (!res.success) throw new Error(res.error || "Failed to create class");

  return sanitizeClass(res.data!);
};

// --- Update class (PUT) ---
export const updateClass = async (
  id: string,
  cls: ClassItem
): Promise<ClassItem> => {
  const res = await fetchAPI<ClassItem>(`${CLASS_ENDPOINT}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cls),
  });

  console.log("updateClass response:", res);

  if (!res.success) throw new Error(res.error || "Failed to update class");

  return sanitizeClass(res.data!);
};

// --- Partial update class (PATCH) ---
export const patchClass = async (
  id: string,
  cls: Partial<ClassItem>
): Promise<ClassItem> => {
  const res = await fetchAPI<ClassItem>(`${CLASS_ENDPOINT}${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cls),
  });

  console.log("patchClass response:", res);

  if (!res.success) throw new Error(res.error || "Failed to patch class");

  return sanitizeClass(res.data!);
};

// --- Delete class ---
export const deleteClass = async (id: string): Promise<void> => {
  const res = await fetchAPI(`${CLASS_ENDPOINT}${id}/`, {
    method: "DELETE",
  });

  console.log("deleteClass response:", res);

  if (!res.success) throw new Error(res.error || "Failed to delete class");
};