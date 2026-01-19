"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import AdvancedTable from "@/components/table/advanced-table";
import { selectionColumn } from "@/components/table/selection-column";
import { X, Plus } from "lucide-react";

import { fetchUsers, createUser, updateUser, deleteUser, User } from "@/app/actions/users/user-services";
import { getUserColumns } from "@/components/table/columns/users-column";

export default function UsersPage() {
  const queryClient = useQueryClient();

  // Modal and form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  // Fetch users
  const { data, isLoading, isError, error, isFetching } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  console.log('Users:', )

  const users = Array.isArray(data) ? data : [];

  // Delete mutation
  const { mutate: deleteUserMutate } = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    },
  });

  const handleDeleteUser = useCallback(
    (id: number) => {
      if (confirm("Are you sure you want to delete this user?")) {
        deleteUserMutate(id);
      }
    },
    [deleteUserMutate]
  );

  const handleBulkDelete = useCallback(
    async (selectedUsers: User[]) => {
      if (!selectedUsers.length) return;

      const results = await Promise.allSettled(
        selectedUsers.map((u) => deleteUser(u.id))
      );

      const hasFailure = results.some((r) => r.status === "rejected");
      if (hasFailure) {
        toast.error("Failed to delete some users.");
      } else {
        toast.success(`${selectedUsers.length} user(s) deleted successfully!`);
      }

      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    [queryClient]
  );

  // Table columns using our reusable function
  const columns = getUserColumns({ onEdit: openModal, onDelete: handleDeleteUser });

  // Open modal for create/edit
  function openModal(user?: User) {
    if (user) {
      setEditingUser(user);
      setForm({
        username: user.username,
        email: user.email,
        password: "",
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setForm({ username: "", email: "", password: "", role: "user" });
    }
    setModalOpen(true);
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, form);
        toast.success("User updated successfully!");
      } else {
        await createUser(form);
        toast.success("User created successfully!");
      }
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save user");
    }
  };

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
          <path d="M3 5h18M7 5V3h10v2m1 0v16H6V5h12Z" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">No users found</p>
        <p className="text-xs text-muted-foreground">
          Adjust your filters or try a different search term.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="text-2xl font-semibold text-text">Users & Roles</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage users and assign roles in your system.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" /> New User
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <AdvancedTable<User>
            columns={[selectionColumn<User>(), ...columns]}
            data={users}
            searchPlaceholder="Search users"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? "Edit User" : "Create User"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...(!editingUser ? { required: true } : {})}
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 bg-red-800 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  {editingUser ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
