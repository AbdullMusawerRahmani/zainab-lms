"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  fetchAttendances,
  deleteAttendance,
  createAttendance,
} from "@/app/actions/students/attendence-services";
import { fetchClasses } from "@/app/actions/classes/class-services";
import {
  fetchStudents,
  fetchStudentsByClass,
} from "@/app/actions/students/Student-services";
import type { Attendance, Student } from "@/types/dashboard/student";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { DeleteAlert } from "@/components/delete-alert";

export default function StudentAttendancePage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [statusByStudent, setStatusByStudent] = useState<
    Record<string, "present" | "absent">
  >({});
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Classes
  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: fetchClasses,
  });

  // All students
  const {
    data: allStudents,
    isFetching: isFetchingStudents,
    isError: isStudentError,
    error: studentError,
  } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });

  // Filter students by selected class
  const students = useMemo(() => {
    if (!selectedClass) return [];
    return allStudents?.filter((s) => s.class_id === selectedClass) || [];
  }, [allStudents, selectedClass]);

  useEffect(() => {
    if (students?.length) {
      const next: Record<string, "present" | "absent"> = {};
      students.forEach((s) => (next[s.id] = "present"));
      setStatusByStudent(next);
    } else {
      setStatusByStudent({});
    }
  }, [students]);

  // Existing attendance list
  const {
    data: existingAttendances,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<Attendance[]>({
    queryKey: ["attendance"],
    queryFn: fetchAttendances,
  });

  const attendances = existingAttendances ?? [];

  const { mutate: deleteAttendanceMutate } = useMutation({
    mutationFn: (id: string) => deleteAttendance(id),
    onSuccess: () => {
      toast.success("Attendance deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: unknown) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to delete attendance"
      ),
  });

  const { mutateAsync: createAttendanceMutate, isPending: isSaving } =
    useMutation({
      mutationFn: async (payload: Attendance) => createAttendance(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["attendance"] });
      },
    });

  const handleSaveAll = useCallback(async () => {
    if (!selectedClass) return toast.error("Please select a class.");
    if (!selectedDate) return toast.error("Please select a date.");
    if (!students?.length)
      return toast.error("No students found for this class.");

    try {
      await Promise.all(
        students.map((s) =>
          createAttendanceMutate({
            id: "",
            attendance_date: selectedDate,
            attendance_status: statusByStudent[s.id] || "present",
            notes: "",
            student_id: s.id,
            class_id: selectedClass,
            recorded_by: null,
            student_info: {
              first_name: s.first_name,
              father_name: s.father_name,
            },
            class_info: {
              id: selectedClass,
              name: "",
              level: "",
              status: "active",
            },
          } as Attendance)
        )
      );
      toast.success("Attendance saved.");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      // reset selections
      setSelectedClass("");
      setStatusByStudent({});
      const today = new Date().toISOString().split("T")[0];
      setSelectedDate(today);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save attendance");
    }
  }, [
    selectedClass,
    selectedDate,
    students,
    statusByStudent,
    createAttendanceMutate,
    queryClient,
  ]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      deleteAttendanceMutate(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteAttendanceMutate]);

  const filteredAttendances = useMemo(() => {
    return attendances.filter((row) => {
      const rowClassId = String(row.class_id);
      const matchClass =
        filterClass === "all" ? true : rowClassId === filterClass;

      const matchDate = filterDate ? row.attendance_date === filterDate : true;

      return matchClass && matchDate;
    });
  }, [attendances, filterClass, filterDate]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAttendances.length / pageSize)
  );
  const currentPage = Math.min(pageIndex, totalPages - 1);
  const pagedAttendances = filteredAttendances.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  const handlePageSizeChange = (value: string) => {
    const size = Number(value);
    setPageSize(size);
    setPageIndex(0);
  };

  if (isLoading)
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 rounded-md" />
            <Skeleton className="h-4 w-1/3 rounded-md" />
          </div>
        </Card>
      </div>
    );

  if (isError)
    return (
      <p className="text-red-500">
        Error: {error?.message || "Failed to load attendance records"}
      </p>
    );

  if (isStudentError)
    return (
      <p className="text-red-500">
        Error:{" "}
        {studentError instanceof Error
          ? studentError.message
          : "Failed to load students"}
      </p>
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="text-2xl font-semibold text-text">
            Student Attendance
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Filter by class and date, mark status, and save.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                Class
              </p>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls, idx) => (
                    <SelectItem
                      key={cls.id ?? idx}
                      value={cls.id ? String(cls.id) : `class-${idx}`}
                    >
                      {cls.name} {cls.level ? `• ${cls.level}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                Date
              </p>
              <Input
                type="date"
                value={selectedDate ?? ""}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="flex items-end justify-start gap-2">
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["attendance"] })
                }
              >
                Refresh
              </Button>
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <div className="pt-2">
              <h1 className="text-xl font-semibold">Mark Attendance</h1>
              <p className="text-xs text-muted-foreground">
                Select a class and date to load students. Default status is
                Present (green).
              </p>
            </div>
            <div className=" px-4 py-3">
              <Button
                onClick={handleSaveAll}
                disabled={isSaving || isFetchingStudents}
              >
                {isSaving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </div>

          <div className="border rounded-2xl bg-background">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold rounded-tl-2xl">
                      Student
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Father
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left font-semibold rounded-tr-2xl">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {isFetchingStudents && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6">
                        <Skeleton className="h-10 w-full rounded-md" />
                      </td>
                    </tr>
                  )}
                  {!isFetchingStudents && students?.length
                    ? students.map((s) => {
                        const status = statusByStudent[s.id] || "present";
                        const isPresent = status === "present";
                        return (
                          <tr key={s.id} className="border-b last:border-b-0">
                            <td className="px-4 py-3 font-semibold text-foreground">
                              {s.first_name} {s.last_name}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {s.father_name}
                            </td>
                            <td className="px-4 py-3">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-6">
                                  {/* Present Radio */}
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`attendance-${s.id}`}
                                      value="present"
                                      checked={status === "present"}
                                      onChange={() =>
                                        setStatusByStudent((prev) => ({
                                          ...prev,
                                          [s.id]: "present",
                                        }))
                                      }
                                      className="h-4 w-4 accent-green-600"
                                    />
                                    <span
                                      className={`text-sm font-medium ${
                                        status === "present"
                                          ? "text-green-600"
                                          : "text-foreground"
                                      }`}
                                    >
                                      Present
                                    </span>
                                  </label>

                                  {/* Absent Radio */}
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`attendance-${s.id}`}
                                      value="absent"
                                      checked={status === "absent"}
                                      onChange={() =>
                                        setStatusByStudent((prev) => ({
                                          ...prev,
                                          [s.id]: "absent",
                                        }))
                                      }
                                      className="h-4 w-4 accent-red-600"
                                    />
                                    <span
                                      className={`text-sm font-medium ${
                                        status === "absent"
                                          ? "text-red-600"
                                          : "text-foreground"
                                      }`}
                                    >
                                      Absent
                                    </span>
                                  </label>
                                </div>
                              </td>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/students/student-attendence/${s.id}`
                                    )
                                  }
                                >
                                  View
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    : !isFetchingStudents && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-muted-foreground"
                          >
                            {selectedClass
                              ? "No students found for this class."
                              : "Select a class to load students."}
                          </td>
                        </tr>
                      )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-10">
            <h1 className="text-xl font-semibold">
              Existing Attendance Records
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage previously saved entries.
            </p>
          </div>

          <div className="rounded-2xl border bg-background">
            <div className="flex flex-col gap-3 border-b px-4 py-3 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Filter by class
                  </p>
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger className="w-full md:w-44">
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {classes?.map((cls, idx) => (
                        <SelectItem
                          key={cls.id ?? idx}
                          value={cls.id ? String(cls.id) : `class-${idx}`}
                        >
                          {cls.name} {cls.level ? `• ${cls.level}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Filter by date
                  </p>
                  <Input
                    type="date"
                    value={filterDate ?? ""}
                    onChange={(e) => {
                      setFilterDate(e.target.value);
                      setPageIndex(0);
                    }}
                    className="w-full md:w-44"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Page size
                  </p>
                  <Select
                    value={String(pageSize)}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-full md:w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50].map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Father
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">Class</th>
                    <th className="px-4 py-2 text-left font-semibold">Date</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isFetching ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6">
                        <Skeleton className="h-10 w-full rounded-md" />
                      </td>
                    </tr>
                  ) : pagedAttendances.length ? (
                    pagedAttendances.map((row, idx) => (
                      <tr
                        key={
                          row.id ??
                          `${row.student_id}-${row.attendance_date}-${idx}`
                        }
                        className="border-b last:border-b-0"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {row.student_info?.first_name ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.student_info?.father_name ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.class_info?.name ?? ""}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.attendance_date}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              row.attendance_status === "present"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.attendance_status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/students/student-attendence/${row.student_id}`
                                )
                              }
                            >
                              View Report
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-muted-foreground"
                      >
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
              <span>
                Page {currentPage + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage + 1 >= totalPages}
                  onClick={() =>
                    setPageIndex((p) => Math.min(totalPages - 1, p + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
