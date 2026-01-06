"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ClassItem } from "@/types/dashboard/class";
import { Button } from "@/components/ui/button";
import { PenIcon, Trash2 } from "lucide-react";

export const getClassColumns = ({
  onDelete,
  onEdit,
}: {
  onDelete: (id: string) => void;
  onEdit: (cls: ClassItem) => void;
}): ColumnDef<ClassItem>[] => {

  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => row.original.level,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full 
          transition-all duration-200 
          ${
            row.original.status === "active"
              ? "bg-green-500 text-white shadow-sm hover:bg-green-200"
              : row.original.status === "inactive"
              ? "bg-red-500 text-white shadow-sm hover:bg-gray-200"
              : "bg-red-100 text-red-800 shadow-sm hover:bg-red-200"
          }`}
      >
        {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
      </span>
      
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const cls = row.original;

        return (
          <div className="flex items-center gap-4">
            <button
             
              variant="outline"
              onClick={() => onEdit(cls)}  
            >
              <PenIcon className="w-4 h-4 text-blue-600" />
            </button>

            <button
              
              
              onClick={() => onDelete(cls.id)}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        );
      },
    },
  ];
};
