"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Student } from "@/types/dashboard/student";
import { Button } from "@/components/ui/button";
import { Eye, Trash, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface StudentColumnActions {
  onEdit?: (student: Student) => void;
  onDelete?: (id: string) => void;
}

export const getStudentColumns = ({
  onEdit,
  onDelete,
}: StudentColumnActions): ColumnDef<Student>[] => [
  {
    accessorKey: "image",
    header: "Photo",
    cell: ({ row }) => {
      const imageUrl = row.getValue("image"); // make sure this is a valid URL
      return imageUrl ? (
        <img
          src={imageUrl}
          alt="Student"
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
          N/A
        </div>
      );
    },
  },
  {
    accessorKey: "first_name",
    header: "First Name",
    cell: ({ row }) => row.getValue("first_name"),
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    cell: ({ row }) => row.getValue("last_name"),
  },
  {
    accessorKey: "father_name",
    header: "Father Name",
    cell: ({ row }) => row.getValue("father_name"),
  },

  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.getValue("email"),
  },
  {
    accessorKey: "primary_mobile",
    header: "Mobile",
    cell: ({ row }) => row.getValue("primary_mobile"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-md text-white ${
          row.getValue("status") === "active" ? "bg-green-500" : "bg-gray-400"
        }`}
      >
        {row.getValue("status")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const student = row.original;
      const router = useRouter();

      return (
        <div className="flex gap-2">
          {/* Eye icon navigates to student detail page */}
          <button
            onClick={() => router.push(`/students/${student.id}`)}
            className="flex items-center justify-center"
          >
            <Eye className="w-4 h-4 text-green-600" />
          </button>

          {/* Delete button */}
          {onDelete && (
            <button  onClick={() => onDelete(student.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      );
    },
  },
];
