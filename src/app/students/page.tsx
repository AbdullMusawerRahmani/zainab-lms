"use client";

import React, { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  fetchStudents,
  deleteStudent as deleteStudentAction,
} from "@/app/actions/students/Student-services";
import type { Student } from "@/types/dashboard/student";
import { Skeleton } from "@/components/ui/skeleton";
import AdvancedTable from "@/components/table/advanced-table";
import { getStudentColumns } from "@/components/table/columns/students-coulmn";
import { selectionColumn } from "@/components/table/selection-column";
import { useRouter } from "next/navigation";


export default function StudentsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, isError, error, isFetching } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });

  const students = data ?? [];

  const { mutate: deleteStudentMutate } = useMutation({
    mutationFn: (id: string) => deleteStudentAction(id),
    onSuccess: () => {
      toast.success("Student deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (err: unknown) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to delete student"
      ),
  });

  const handleDeleteStudent = useCallback(
    (id: string) => {
      deleteStudentMutate(id);
    },
    [deleteStudentMutate]
  );

  const handleBulkDelete = useCallback(
    async (selectedStudents: Student[]) => {
      if (!selectedStudents.length) return;

      const results = await Promise.allSettled(
        selectedStudents.map((student) => deleteStudentAction(student.id))
      );

      const hasFailure = results.some((result) => result.status === "rejected");

      if (hasFailure) {
        toast.error("Failed to delete some students. Please try again.");
      } else {
        toast.success(
          `${selectedStudents.length} student${
            selectedStudents.length === 1 ? "" : "s"
          } deleted successfully!`
        );
      }

      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    [queryClient]
  );

  const columns = useMemo(
    () => [
      selectionColumn<Student>(),
      ...getStudentColumns({
        onDelete: handleDeleteStudent,
      }),
    ],
    [handleDeleteStudent]
  );

  const emptyState = (
    <div className="flex flex-col items-center justify-center space-y-3 py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 5h18M7 5V3h10v2m1 0v16H6V5h12Z" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">No students found</p>
        <p className="text-xs text-muted-foreground">
          Adjust your filters or try a different search term.
        </p>
      </div>
    </div>
  );

  if (isLoading)
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 rounded-md" />
            <Skeleton className="h-4 w-1/3 rounded-md" />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="mb-2 h-6 w-56 rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-border py-3"
                >
                  <Skeleton className="h-4 w-1/4 rounded" />
                  <Skeleton className="h-4 w-1/6 rounded" />
                  <Skeleton className="h-4 w-1/5 rounded" />
                  <Skeleton className="h-4 w-10 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );

  if (isError)
    return (
      <p className="text-red-500">
        Error: {error?.message || "Failed to load students"}
      </p>
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="text-2xl font-semibold text-text">Students</CardTitle>
          <div className="flex flex-row justify-between">
         
            <div> 
          <p className="text-sm text-muted-foreground">
            Filter, sort, and manage student records in one place.
          </p>
          </div>
             <div>
              <button
                onClick={() => router.push("/students/add")}
                className="bg-blue-600 text-white border-2 border-blue-600 rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
              >
                Add Student
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdvancedTable<Student>
            columns={columns}
            data={students}
            searchPlaceholder="students"
            searchColumn="first_name"
            onDeleteSelected={handleBulkDelete}
            isClickable={false}
            isLoading={isFetching}
            paginationKey="students_page"
            pageSizeKey="students_page_size"
            emptyStateComponent={emptyState}
          />
        </CardContent>
      </Card>
    </div>
  );
}
