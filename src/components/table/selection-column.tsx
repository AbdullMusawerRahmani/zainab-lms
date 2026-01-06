"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

export function selectionColumn<T>(selectable: boolean = true): ColumnDef<T> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center gap-2">
        {selectable && (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="w-4 h-4"
          />
        )}
        <div className="w-4">#</div>
      </div>
    ),
    cell: ({ row, table }) => {
      // Calculate the correct index based on pagination
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      const rowIndex = pageIndex * pageSize + row.index + 1;

      return (
        <div className="flex items-center gap-2">
          {selectable && (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          )}
          <div className="w-4">{rowIndex}</div>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  }
} 