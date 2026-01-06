import { ColumnDef } from "@tanstack/react-table";
import type { Attendance } from "@/types/dashboard/student";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const getAttendanceColumns = ({
  onDelete,
}: {
  onDelete: (id: string) => void;
}): ColumnDef<Attendance>[] => [
  {
    accessorKey: "student_info.first_name",
    header: "Name",
    cell: ({ row }) => {
      const info = row.original.student_info;
      return (
        <span>
          {info.first_name}
        </span>
      );
    },
  },
    {
    accessorKey: "student_info.first_name",
    header: "Father Name",
    cell: ({ row }) => {
      const info = row.original.student_info;
      return (
        <span>
        {info.father_name}
        </span>
      );
    },
  },
  {
    accessorKey: "class_info.name",
    header: "Class",
    cell: ({ row }) => {
      const cls = row.original.class_info;
      return (
        <span>
          {cls.name} - {cls.level}
        </span>
      );
    },
  },
  {
    accessorKey: "attendance_date",
    header: "Date",
  },
  {
    accessorKey: "attendance_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.attendance_status;

      const color =
        status === "present"
          ? "text-green-600 bg-green-200"
          : status === "absent"
          ? "text-red-600 bg-red-200"
          : status === "late"
          ? "text-yellow-600 bg-yellow-200"
          : "text-blue-600 bg-blue-200";

      return (
        <span
          className={`px-2 py-1 text-xs rounded ${color}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(id)}
          className="flex items-center gap-1"
        >
          <Trash2 size={14} />
          Delete
        </Button>
      );
    },
  },
];
