"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createEmployee } from "@/app/actions/employee/employee-services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddEmployeePage() {
  const router = useRouter();

  const inputClasses =
    "form-input border rounded-md p-2 w-full bg-white dark:bg-gray-900 " +
    "border-neutral-300 dark:border-neutral-700 text-sm " +
    "focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition";

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    father_name: "",
    grand_father_name: "",
    dob: "",
    gender: "male",
    address: "",
    primary_mobile: "",
    secondary_mobile: "",
    email: "",
    status: "active",
    country: "",
    current_province: "",
    main_province: "",
    image: null as File | null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          fd.append(key, value as any);
        }
      });

      await createEmployee(fd);
      toast.success("Employee created successfully!");
      router.push("/employee");
    } catch (error: any) {
      toast.error(error.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Add New Employee
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
            {/* SECTION 1: PHOTO + BASIC INFO */}
            <Card className="rounded-3xl p-8 shadow-xl">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                {/* PHOTO */}
                <div>
                  <CardTitle className="mb-4 text-2xl font-bold">
                    Employee Photo
                  </CardTitle>

                  <input
                    type="file"
                    id="imageInput"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div
                    onClick={() =>
                      document.getElementById("imageInput")?.click()
                    }
                    className="flex h-72 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Click to upload employee photo
                      </span>
                    )}
                  </div>
                </div>

                {/* BASIC INFO */}
                <div>
                  <CardTitle className="mb-4 text-2xl font-bold">
                    Basic Information
                  </CardTitle>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label>First Name *</label>
                      <input
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label>Last Name *</label>
                      <input
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label>Father Name</label>
                      <input
                        name="father_name"
                        value={formData.father_name}
                        onChange={handleChange}
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label>Grand Father Name</label>
                      <input
                        name="grand_father_name"
                        value={formData.grand_father_name}
                        onChange={handleChange}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* SECTION 2: PERSONAL & CONTACT */}
            <Card className="space-y-8 rounded-3xl p-6 shadow-lg">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label>Primary Mobile *</label>
                  <input
                    name="primary_mobile"
                    value={formData.primary_mobile}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label>Secondary Mobile</label>
                  <input
                    name="secondary_mobile"
                    value={formData.secondary_mobile}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label>Country</label>
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label>Current Province</label>
                  <input
                    name="current_province"
                    value={formData.current_province}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label>Main Province</label>
                  <input
                    name="main_province"
                    value={formData.main_province}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`${inputClasses} min-h-[110px]`}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Add Employee"}
                </Button>
              </div>
            </Card>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
