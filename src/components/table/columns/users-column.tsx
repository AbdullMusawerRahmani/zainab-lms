"use client";

import React, { useMemo } from "react";
import { User } from "@/app/actions/users/user-services";
import { Pencil, Trash } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

interface GetUserColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export const getUserColumns = ({
  onEdit,
  onDelete,
}: GetUserColumnsProps): ColumnDef<User>[] => {
  return useMemo(
    () => [
      // {
      //   accessorKey: "id",
      //   header: "ID",
      //   cell: ({ row }) => <span>{row.original.id}</span>,
      // },
      {
        accessorKey: "username",
        header: "Username",
        cell: ({ row }) => <span>{row.original.username}</span>,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span>{row.original.email}</span>,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <span>{row.original.role}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(row.original)}
              className="flex items-center gap-1 px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button
              onClick={() => onDelete(row.original.id)}
              className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              <Trash className="h-4 w-4" /> Delete
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );
};