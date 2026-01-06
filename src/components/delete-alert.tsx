"use client";

import { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DeleteAlertProps = {
  count?: number;
  title?: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void | Promise<void>;
  trigger: ReactNode;
};

export function DeleteAlert({
  count,
  title,
  description,
  open,
  onOpenChange,
  onDelete,
  trigger,
}: DeleteAlertProps) {
  const itemLabel =
    count && count > 0
      ? `${count} selected ${count === 1 ? "item" : "items"}`
      : "this item";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? "Delete items?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              `This action cannot be undone. This will permanently delete ${itemLabel} from your records.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async () => {
              await onDelete();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

