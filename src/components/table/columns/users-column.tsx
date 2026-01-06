"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/dashboard/user";
import { Badge } from "@/components/ui/badge";
import { Edit, UserCheck, Trash2 } from "lucide-react";

interface UserColumnActions {
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
  onAssignRole?: (user: User) => void;
}

export const getUserColumns = ({
  onEdit,
  onDelete,
  onAssignRole,
}: UserColumnActions): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("id")}</span>
    ),
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("username")}</span>
    ),
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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-blue-600">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_staff",
    header: "Staff",
    cell: ({ row }) => {
      const isStaff = row.getValue("is_staff") as boolean;
      return (
        <Badge variant={isStaff ? "default" : "outline"}>
          {isStaff ? "Staff" : "User"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex gap-2">
          {/* View/Edit icon navigates to user detail/edit page */}
          <button
            onClick={() => onEdit?.(user)}
            className="flex items-center justify-center p-1 hover:bg-gray-100 rounded"
            title="Edit User"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>

          {/* Assign Role button */}
          {onAssignRole && (
            <button
              onClick={() => onAssignRole(user)}
              className="flex items-center justify-center p-1 hover:bg-gray-100 rounded"
              title="Assign Role"
            >
              <UserCheck className="w-4 h-4 text-green-600" />
            </button>
          )}

          {/* Delete button */}
          {onDelete && (
            <button
              onClick={() => onDelete(user.id.toString())}
              className="flex items-center justify-center p-1 hover:bg-gray-100 rounded"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      );
    },
  },
];
