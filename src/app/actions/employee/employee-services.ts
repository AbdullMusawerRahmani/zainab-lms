"use server";

import { fetchAPI } from "@/lib/api";
import type { Employee } from "@/types/dashboard/employee";

const EMPLOYEE_ENDPOINT = "/employee/";

// --- Fetch all employees ---
export const fetchEmployees = async (): Promise<Employee[]> => {
  const res = await fetchAPI<Employee[]>(EMPLOYEE_ENDPOINT, {
    method: "GET",
  });

  console.log("fetchEmployees response:", res);

  if (!res.success) {
    throw new Error(res.error || "Failed to fetch employees");
  }

  return res.data!;
};

// --- Fetch single employee by ID ---
export const fetchEmployeeById = async (id: string): Promise<Employee> => {
  const res = await fetchAPI<Employee>(`${EMPLOYEE_ENDPOINT}${id}/`, {
    method: "GET",
  });

  console.log("fetchEmployeeById response:", res);

  if (!res.success) {
    throw new Error(res.error || "Failed to fetch employee");
  }

  return res.data!;
};

// --- Create new employee ---
export const createEmployee = async (
  employee: Employee
): Promise<Employee> => {
  const res = await fetchAPI<Employee>(EMPLOYEE_ENDPOINT, {
    method: "POST",
    hasFile: true,
    body: employee,
  });

  console.log("createEmployee response:", res);

  if (!res.success) {
    throw new Error(res.error || "Failed to create employee");
  }

  return res.data!;
};

// --- Update employee completely (PUT) ---
export const updateEmployee = async (
  id: string,
  employee: Employee
): Promise<Employee> => {
  const res = await fetchAPI<Employee>(`${EMPLOYEE_ENDPOINT}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });

  console.log("updateEmployee response:", res);

  if (!res.success) {
    throw new Error(res.error || "Failed to update employee");
  }

  return res.data!;
};

// --- Partial update (PATCH) ---
export const patchEmployee = async (
  id: string,
  employee: Employee
): Promise<Employee> => {
  const res = await fetchAPI<Employee>(`${EMPLOYEE_ENDPOINT}${id}/`, {
    method: "PATCH",
    hasFile: true,
    body: employee,
  });

  console.log("patchEmployee response:", res);

  if (!res.success) {
    throw new Error(res.error || "Failed to patch employee");
  }

  return res.data!;
};

// --- Delete employee ---
export const deleteEmployee = async (id: string): Promise<void> => {
  const res = await fetchAPI(`${EMPLOYEE_ENDPOINT}${id}/`, {
    method: "DELETE",
  });

  console.log("deleteEmployee response:", res);

  if (!res.success) {
    throw new Error(res.error || "Failed to delete employee");
  }
};
