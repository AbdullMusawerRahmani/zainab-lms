"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

import {
  fetchAttendanceByStudentAndDate,
  patchAttendance,
  deleteAttendance,
} from "@/app/actions/students/attendence-services";

import type { Attendance } from "@/types/dashboard/student";

// ==========================
// Attendance status metadata
// ==========================
const STATUS_META: Record<
  string,
  { label: string; class: string; dot: string }
> = {
  present: { label: "Present", class: "bg-green-100 text-green-700", dot: "bg-green-500" },
  absent: { label: "Absent", class: "bg-red-100 text-red-700", dot: "bg-red-500" },
  late: { label: "Late", class: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  excused: { label: "Excused", class: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
};

export default function AttendanceCalendarPage() {
  const { id } = useParams();
  const studentId = Array.isArray(id) ? id[0] : id;
  const queryClient = useQueryClient();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12

  // Date range for selected month
  const fromDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const toDate = `${year}-${String(month).padStart(2, "0")}-31`;

  // Fetch attendance data
  const { data, isLoading } = useQuery<Attendance[]>({
    queryKey: ["attendance-calendar", studentId, year, month],
    queryFn: () => fetchAttendanceByStudentAndDate(studentId!, fromDate, toDate),
    enabled: !!studentId,
  });

  // Mutations
  const patchMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Attendance }) =>
      patchAttendance(id, {
        attendance_date: payload.attendance_date,
        attendance_status: payload.attendance_status,
        notes: payload.notes || "",
        student_id: payload.student_id,
        class_id: payload.class_id,
      }),
    onSuccess: () => {
      toast.success("Attendance updated");
      queryClient.invalidateQueries({ queryKey: ["attendance-calendar"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAttendance,
    onSuccess: () => {
      toast.success("Attendance deleted");
      queryClient.invalidateQueries({ queryKey: ["attendance-calendar"] });
    },
  });

  // Map attendance by date
  const attendanceMap = useMemo(() => {
    const map: Record<string, Attendance> = {};
    data?.forEach((a) => {
      map[a.attendance_date] = a;
    });
    return map;
  }, [data]);

  // Generate days of month
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (isLoading)
    return (
      <div className="grid grid-cols-7 gap-4">
        {Array.from({ length: 30 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );

  return (
    <Card className="rounded-3xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Attendance Calendar</CardTitle>

        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center mb-2 font-medium text-muted-foreground">
          {weekdays.map((wd) => (
            <div key={wd}>{wd}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-4">
          {days.map((day) => {
            const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const record = attendanceMap[date];

            return (
              <div
                key={day}
                className="group border rounded-2xl p-3 flex flex-col justify-between bg-background
                hover:shadow-lg transition-shadow"
              >
                {/* Date */}
                <div className="text-sm font-semibold text-muted-foreground">{day}</div>

                {/* Status */}
                {record ? (
                  <div
                    className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5
                    rounded-full text-xs font-medium
                    ${STATUS_META[record.attendance_status].class}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full
                      ${STATUS_META[record.attendance_status].dot}`}
                    />
                    {STATUS_META[record.attendance_status].label}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-muted-foreground italic text-center">
                    Not marked
                  </div>
                )}

                {/* Actions */}
                {record && (
                  <div className="mt-3 space-y-2">
                    {/* Status Change */}
                    <Select
                      value={record.attendance_status}
                      onValueChange={(value) =>
                        patchMutation.mutate({
                          id: record.id!,
                          payload: {
                            ...record,
                            attendance_status: value as any,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs w-full">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="excused">Excused</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-destructive hover:bg-destructive/10"
                      onClick={() => deleteMutation.mutate(record.id!)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
