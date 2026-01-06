"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  CalendarDays,
  Flag,
  Globe2,
  IdCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import { fetchEmployeeById } from "@/app/actions/employee/employee-services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const statusColor = {
  active: "default",
  inactive: "outline",
  pending: "secondary",
  blocked: "destructive",
  deleted: "destructive",
} as const;

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const employeeId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const {
    data: employee,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => fetchEmployeeById(employeeId!),
    enabled: !!employeeId,
  });

  const displayName =
    `${employee?.first_name || ""} ${employee?.last_name || ""}`.trim() ||
    "Employee";

  const statusVariant =
    statusColor[employee?.status ?? "pending"] ?? "secondary";

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-10 w-64 rounded-md" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-red-500">
        Error:{" "}
        {error instanceof Error ? error.message : "Failed to load employee"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-3xl shadow-2xl">
        <div className="relative bg-gradient-to-r from-primary to-sky-600 px-6 pb-16 pt-6 text-white">
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white/40 bg-white/20 shadow-lg">
              {employee?.image ? (
                <img
                  src={employee.image}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-semibold">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm text-white/80">Employee Profile</p>
              <h1 className="truncate text-2xl font-bold">{displayName}</h1>

              <div className="mt-2 flex flex-wrap gap-2 text-sm text-white/80">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                  <IdCard className="h-4 w-4" />
                  {employee?.id}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                  <ShieldCheck className="h-4 w-4" />
                  {employee?.status}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                  <Globe2 className="h-4 w-4" />
                  {employee?.country || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={statusVariant}>
                {employee?.status ?? "pending"}
              </Badge>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  router.push(`/employee/${employeeId}/edit`)
                }
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="mt-2 space-y-10">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-background p-5 shadow-sm">
              <CardTitle className="mb-4 text-lg">Overview</CardTitle>
              <div className="grid gap-3 sm:grid-cols-2 text-muted-foreground">
                <InfoRow icon={<User className="h-4 w-4" />} label="Full Name" value={displayName} />
                <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Date of Birth" value={employee?.dob || "-"} />
                <InfoRow icon={<BadgeCheck className="h-4 w-4" />} label="Gender" value={employee?.gender || "-"} />
                <InfoRow icon={<ShieldCheck className="h-4 w-4" />} label="Status" value={employee?.status || "-"} />
                <InfoRow icon={<IdCard className="h-4 w-4" />} label="Position" value={employee?.position || "-"} />
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Province" value={employee?.province || "-"} />
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-5 shadow-sm">
              <CardTitle className="mb-4 text-lg">Contact</CardTitle>
              <div className="grid gap-3 sm:grid-cols-2 text-muted-foreground">
                <InfoRow icon={<Phone className="h-4 w-4" />} label="Mobile" value={employee?.mobile || "-"} />
                <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={employee?.email || "-"} />
                <InfoRow icon={<Flag className="h-4 w-4" />} label="Nationality" value={employee?.country || "-"} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-5 shadow-sm">
            <CardTitle className="mb-4 text-lg">Address</CardTitle>
            <p className="text-muted-foreground">
              {employee?.address || "No address provided"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-3 py-2">
      <div className="text-primary">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground/70">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
