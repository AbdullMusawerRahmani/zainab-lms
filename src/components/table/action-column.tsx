"use client";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { DeleteAlert } from "../delete-alert";

type ActionColumnProps<T> = {
  FormComponent?: React.ComponentType<{ data: T }>;
  onDelete: (id: string) => void;
  onEdit?: (data: T) => void;
  deleteKey?: keyof T; 
};

export function ActionColumn<T extends { id: string }>({
  FormComponent,
  onDelete,
  onEdit,
  deleteKey = "id",
}: ActionColumnProps<T>): ColumnDef<T> {
  const CellComponent = ({ row }: { row: Row<T> }) => {
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const data = row.original;

    return (
      <div className="flex justify-end gap-1" data-actions>
        {FormComponent && <FormComponent data={data} />}
        {onEdit && (
          <Button
            variant="ghost"
            className="p-2 px-3 hover:bg-primary/10 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(data);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        <DeleteAlert
          open={showDeleteAlert}
          onOpenChange={setShowDeleteAlert}
          onDelete={() => {
            onDelete(String(data[deleteKey])); 
            setShowDeleteAlert(false);  
          }}
          trigger={
            <Button
              variant="ghost"
              className="p-2 px-3 hover:bg-primary/10 rounded-full transition-colors hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        />
      </div>
    );
  };

  return {
    id: "actions",
    enableHiding: false,
    cell: CellComponent,
  };
}
