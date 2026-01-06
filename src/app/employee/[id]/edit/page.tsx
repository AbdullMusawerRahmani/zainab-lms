"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  fetchEmployeeById,
  patchEmployee,
} from "@/app/actions/employee/employee-services";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditEmployeePage() {
  const { id } = useParams();
  const router = useRouter();

  const inputClasses =
    "form-input border rounded-md p-2 w-full bg-white dark:bg-gray-900 " +
    "border-neutral-300 dark:border-neutral-700 text-sm " +
    "focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition";

  const [formData, setFormData] = useState<any>({
    first_name: "",
    last_name: "",
    father_name: "",
    dob: "",
    gender: "male",
    address: "",
    primary_mobile: "",
    secondary_mobile: "",
    email: "",
    status: "active",
    country: "",
    current_province: "",
    image: null,
    position: "",
    department: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load employee data
  useEffect(() => {
    if (!id) return;

    const loadEmployee = async () => {
      try {
        const data = await fetchEmployeeById(id as string);
        setFormData({
          ...data,
          image: null,
        });
        setImagePreview(data.image || null);
      } catch (err: any) {
        toast.error(err.message || "Failed to load employee");
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev: any) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "image") fd.append(key, formData[key]);
      });

      if (formData.image) {
        fd.append("image", formData.image);
      }

      await patchEmployee(id as string, fd);

      toast.success("Employee updated successfully!");
      router.push("/employee");
    } catch (err: any) {
      toast.error(err.message || "Failed to update employee");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-4">Loading employee...</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Edit Employee
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">

            {/* Section 1: Photo + Basic Info */}
            <Card className="rounded-3xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* Photo */}
                <div>
                  <CardTitle className="mb-4 text-xl font-bold">
                    Employee Photo
                  </CardTitle>

                  <input
                    type="file"
                    id="imageInput"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div
                    onClick={() =>
                      document.getElementById("imageInput")?.click()
                    }
                    className="flex h-72 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Click to upload employee photo
                      </span>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div>
                  <CardTitle className="mb-4 text-xl font-bold">
                    Basic Information
                  </CardTitle>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                      className={inputClasses}
                    />

                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                      className={inputClasses}
                    />

                    <input
                      name="father_name"
                      value={formData.father_name}
                      onChange={handleChange}
                      placeholder="Father Name"
                      className={inputClasses}
                    />

                    <input
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="Position"
                      className={inputClasses}
                    />

                    <input
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Department"
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 2: Personal & Contact */}
            <Card className="rounded-3xl p-6 shadow-lg space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={inputClasses}
                />

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input
                  name="primary_mobile"
                  value={formData.primary_mobile}
                  onChange={handleChange}
                  placeholder="Primary Mobile"
                  className={inputClasses}
                />

                <input
                  name="secondary_mobile"
                  value={formData.secondary_mobile}
                  onChange={handleChange}
                  placeholder="Secondary Mobile"
                  className={inputClasses}
                />

                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={inputClasses}
                />
              </div>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className={`${inputClasses} min-h-[120px]`}
              />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Card>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
