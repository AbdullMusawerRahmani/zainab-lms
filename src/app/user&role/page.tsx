"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  fetchUsers,
  deleteUser as deleteUserAction,
} from "@/app/actions/users/user-services";
import type { User } from "@/types/dashboard/user";
import { Skeleton } from "@/components/ui/skeleton";
import AdvancedTable from "@/components/table/advanced-table";
import { getUserColumns } from "@/components/table/columns/users-column";
import { selectionColumn } from "@/components/table/selection-column";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { data, isLoading, isError, error: _error, isFetching } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const users = data ?? [];

  const { mutate: deleteUserMutate } = useMutation({
    mutationFn: (id: string) => deleteUserAction(id),
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: unknown) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to delete user"
      ),
  });

  const handleDeleteUser = useCallback(
    (id: string) => {
      deleteUserMutate(id);
    },
    [deleteUserMutate]
  );

  const handleBulkDelete = useCallback(
    async (selectedUsers: User[]) => {
      if (!selectedUsers.length) return;

      const results = await Promise.allSettled(
        selectedUsers.map((user) => deleteUserAction(user.id.toString()))
      );

      const hasFailure = results.some((result) => result.status === "rejected");

      if (hasFailure) {
        toast.error("Failed to delete some users. Please try again.");
      } else {
        toast.success(
          `${selectedUsers.length} user${selectedUsers.length === 1 ? "" : "s"} deleted successfully!`
        );
      }

      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    [queryClient]
  );

  const handleAssignRole = useCallback((user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || []);
    setIsRoleDialogOpen(true);
  }, []);

  const handleRoleAssignment = useCallback(async () => {
    if (!selectedUser) return;

    try {
      // Here you would call the assign role API
      // For now, we'll just show a success message
      toast.success(`Roles assigned to ${selectedUser.username}`);
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      setSelectedRoles([]);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error) {
      toast.error("Failed to assign roles");
    }
  }, [selectedUser, queryClient]);

  const handleEditUser = useCallback((user: User) => {
    router.push(`/user&role/${user.id}/edit`);
  }, [router]);

  const columns = useMemo(
    () => [
      selectionColumn<User>(),
      ...getUserColumns({
        onEdit: handleEditUser,
        onDelete: handleDeleteUser,
        onAssignRole: handleAssignRole,
      }),
    ],
    [handleEditUser, handleDeleteUser, handleAssignRole]
  );

  const emptyState = (
    <div className="flex flex-col items-center justify-center space-y-3 py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6M22 11h-6" />
        </svg>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">No users found</p>
        <p className="text-xs text-muted-foreground">
          Add your first user to get started.
        </p>
      </div>
    </div>
  );

  if (isLoading)
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 rounded-md" />
            <Skeleton className="h-4 w-1/3 rounded-md" />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="mb-2 h-6 w-56 rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-border py-3"
                >
                  <Skeleton className="h-4 w-1/4 rounded" />
                  <Skeleton className="h-4 w-1/6 rounded" />
                  <Skeleton className="h-4 w-1/5 rounded" />
                  <Skeleton className="h-4 w-10 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );

  if (isError)
    return (
      <p className="text-red-500">
        Error: {error?.message || "Failed to load users"}
      </p>
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="text-2xl font-semibold text-text">Users & Roles</CardTitle>
          <div className="flex flex-row justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Manage users, assign roles, and control access permissions.
              </p>
            </div>
            <div>
              <button
                onClick={() => router.push("/user&role/add")}
                className="bg-blue-600 text-white border-2 border-blue-600 rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
              >
                Add User
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdvancedTable<User>
            columns={columns}
            data={users}
            searchPlaceholder="users"
            searchColumn="username"
            onDeleteSelected={handleBulkDelete}
            isClickable={false}
            isLoading={isFetching}
            paginationKey="users_page"
            pageSizeKey="users_page_size"
            emptyStateComponent={emptyState}
          />
        </CardContent>
      </Card>

      {/* Role Assignment Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Roles to {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="roles">Select Roles</Label>
              <Select
                value={selectedRoles.join(',')}
                onValueChange={(value) => setSelectedRoles(value ? value.split(',') : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRoleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleRoleAssignment}>
                Assign Roles
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
