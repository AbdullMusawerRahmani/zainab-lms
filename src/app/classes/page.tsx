"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  fetchClasses,
  deleteClass as deleteClassAction,
  createClass,
  updateClass,
} from "@/app/actions/classes/class-services";
import type { ClassItem } from "@/types/dashboard/class";
import { Skeleton } from "@/components/ui/skeleton";
import AdvancedTable from "@/components/table/advanced-table";
import { getClassColumns } from "@/components/table/columns/classes-coulmn";
import { selectionColumn } from "@/components/table/selection-column";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ClassesPage() {
  const queryClient = useQueryClient();

  // -------------------------
  // Modal State
  // -------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [formData, setFormData] = useState<ClassItem>({
    id: "",
    name: "",
    level: "",
    status: "",
  });

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({ id: "", name: "", level: "", status: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (cls: ClassItem) => {
    setEditingClass(cls);
    setFormData(cls);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // -------------------------
  // Fetch Classes
  // -------------------------
  const { data, isLoading, isError, error, isFetching } = useQuery<ClassItem[]>({
    queryKey: ["classes"],
    queryFn: fetchClasses,
  });

  const classes = data ?? [];

  // -------------------------
  // Delete Class
  // -------------------------
  const { mutate: deleteClassMutate } = useMutation({
    mutationFn: (id: string) => deleteClassAction(id),
    onSuccess: () => {
      toast.success("Class deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Failed to delete class"),
  });

  const handleDeleteClass = useCallback(
    (id: string) => deleteClassMutate(id),
    [deleteClassMutate]
  );

  // -------------------------
  // Bulk Delete
  // -------------------------
  const handleBulkDelete = useCallback(
    async (selectedClasses: ClassItem[]) => {
      if (!selectedClasses.length) return;

      const results = await Promise.allSettled(
        selectedClasses.map((cls) => deleteClassAction(cls.id))
      );

      const failed = results.some((r) => r.status === "rejected");

      if (failed) {
        toast.error("Failed to delete some classes.");
      } else {
        toast.success(
          `${selectedClasses.length} class${selectedClasses.length > 1 ? "es" : ""} deleted!`
        );
      }

      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    [queryClient]
  );

  // -------------------------
  // Columns
  // -------------------------
const columns = useMemo(
  () => [
    selectionColumn<ClassItem>(),
    ...getClassColumns({
      onDelete: handleDeleteClass,
      onEdit: openEditModal,   // <-- IMPORTANT
    }),
  ],
  [handleDeleteClass]
);


  // -------------------------
  // Submit Form (Add / Edit)
  // -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.level || !formData.status) {
      return toast.error("All fields (name, level, status) are required!");
    }

    try {
      if (editingClass) {
        await updateClass(editingClass.id, formData);
        toast.success("Class updated successfully!");
      } else {
        await createClass(formData);
        toast.success("Class created successfully!");
      }

      queryClient.invalidateQueries({ queryKey: ["classes"] });
      closeModal();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save class");
    }
  };

  // -------------------------
  // Loading Skeleton
  // -------------------------
  if (isLoading)
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="p-6">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-4 w-1/3 rounded-md mt-2" />
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-56 mb-2 rounded-md" />
          </CardHeader>
          <CardContent>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b py-3">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/5" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );

  // -------------------------
  // Error Handling
  // -------------------------
  if (isError)
    return <p className="text-red-600">Error: {error?.message}</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <Card>
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="text-2xl font-bold">Classes</CardTitle>

          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Manage classes, filters, and sorting.
            </p>

            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
            >
              Add Class
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <AdvancedTable<ClassItem>
            columns={columns}
            data={classes}
            searchPlaceholder="Search classes"
            searchColumn="name"
            isClickable={false}
            onDeleteSelected={handleBulkDelete}
            isLoading={isFetching}
            paginationKey="classes_page"
            pageSizeKey="classes_page_size"
          />
        </CardContent>
      </Card>

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Edit Class" : "Add Class"}</DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* NAME */}
            <div>
              <label className="block text-sm mb-1 font-medium">Name *</label>
              <input
                type="text"
                className="w-full border rounded-md p-2 dark:bg-gray-900 dark:text-white"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* LEVEL */}
            <div>
              <label className="block text-sm mb-1 font-medium ">Level *</label>
              <input
                type="text"
                className="w-full border rounded-md p-2 dark:bg-gray-900 dark:text-white"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                required
              />
            </div>

            {/* STATUS */}
      <div>
  <label className="block text-sm mb-1 font-medium">Status *</label>
  <select
    className="w-full border rounded-md p-2 dark:bg-gray-900 dark:text-white"
    value={formData.status}
    onChange={(e) =>
      setFormData({ ...formData, status: e.target.value })
    }
    required
  >
    <option value="">Select Status</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>
</div>


            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700"
            >
              {editingClass ? "Save Changes" : "Add Class"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
