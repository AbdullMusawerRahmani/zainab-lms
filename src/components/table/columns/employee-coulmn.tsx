"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Employee } from "@/types/dashboard/employee";
import { Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface EmployeeColumnActions {
  onEdit?: (employee: Employee) => void;
  onDelete?: (id: string) => void;
}

export const getEmployeeColumns = ({
  onEdit,
  onDelete,
}: EmployeeColumnActions): ColumnDef<Employee>[] => [
  {
    accessorKey: "image",
    header: "Photo",
    cell: ({ row }) => {
      const imageUrl = row.getValue("image") as string | undefined;

      return imageUrl ? (
        <img
          src={imageUrl}
          alt="Employee"
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
          row.getValue("status") === "active"
            ? "bg-green-500"
            : "bg-gray-400"
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
      const employee = row.original;
      const router = useRouter();

      return (
        <div className="flex gap-2">
          {/* View employee details */}
          <button
            onClick={() => router.push(`/employee/${employee.id}`)}
            className="flex items-center justify-center"
          >
            <Eye className="w-4 h-4 text-green-600" />
          </button>

          {/* Delete employee */}
          {onDelete && (
            <button onClick={() => onDelete(employee.id!)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      );
    },
  },
];
