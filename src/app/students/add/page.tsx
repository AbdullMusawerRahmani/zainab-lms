"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createStudent } from "@/app/actions/students/Student-services";
import { fetchClasses } from "@/app/actions/classes/class-services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddStudentPage() {
  const router = useRouter();

  const inputClasses =
    "form-input border rounded-md p-2 w-full bg-white dark:bg-gray-900 " +
    "border-neutral-300 dark:border-neutral-700 text-sm " +
    "focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition";

  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    status: "pending",
    country: "",
    current_province: "",
    main_province: "",
    class_id: "",
    image: null as File | null,
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await fetchClasses();
        setClasses(res);
      } catch (error: any) {
        toast.error(error.message || "Failed to load classes");
      } finally {
        setLoadingClasses(false);
      }
    };

    loadClasses();
  }, []);

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

    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const fd = new FormData();
      fd.append("first_name", formData.first_name);
      fd.append("last_name", formData.last_name);
      fd.append("father_name", formData.father_name);
      fd.append("grand_father_name", formData.grand_father_name);
      fd.append("dob", formData.dob);
      fd.append("gender", formData.gender);
      fd.append("address", formData.address);
      fd.append("primary_mobile", formData.primary_mobile);
      fd.append("secondary_mobile", formData.secondary_mobile);
      fd.append("email", formData.email);
      fd.append("status", formData.status);
      fd.append("country", formData.country);
      fd.append("current_province", formData.current_province);
      fd.append("main_province", formData.main_province);
      fd.append("class_id", formData.class_id);
  
      if (formData.image) {
        fd.append("image", formData.image); // File object directly
      }
  
      await createStudent(fd); // make sure createStudent sends FormData as body
      toast.success("Student created successfully!");
      router.push("/students");
    } catch (error: any) {
      toast.error(error.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Add New Student</CardTitle>
        </CardHeader>
        <CardContent>


          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-8 l"
          >
                  {/* Section 1: Photo + Basic/Family/Class */}
        {/* Section 1: Photo + Basic/Family/Class */}
        <Card className="rounded-3xl p-8 shadow-xl transition duration-300 hover:shadow-2xl">

          {/* GRID 50/50 ON DESKTOP — STACKED ON MOBILE */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

            {/* LEFT SIDE — STUDENT PHOTO */}
            <div>
              <CardTitle className="mb-4 text-2xl font-bold text-foreground/80">
                Student Photo
              </CardTitle>

              {/* Hidden File Input */}
              <input
                type="file"
                name="image"
                id="imageInput"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Photo Upload Box */}
              <div
                onClick={() => document.getElementById("imageInput")?.click()}
                className="flex h-72 w-full cursor-pointer items-center justify-center overflow-hidden 
                          rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 
                          transition hover:border-blue-500 hover:bg-blue-50
                          dark:border-neutral-700 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Click to upload student photo
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT SIDE — BASIC INFORMATION */}
            <div>
              <CardTitle className="mb-4 text-2xl font-bold text-foreground/80">
                Basic Information
              </CardTitle>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-muted-foreground">

                {/* First Name */}
                <div>
                  <label className="font-medium">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="font-medium">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>

                {/* Father Name */}
                <div>
                  <label className="font-medium">Father Name</label>
                  <input
                    type="text"
                    name="father_name"
                    value={formData.father_name}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>

                {/* Grandfather Name */}
                <div>
                  <label className="font-medium">Grand Father Name</label>
                  <input
                    type="text"
                    name="grand_father_name"
                    value={formData.grand_father_name}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>

                {/* Class */}
                <div className="sm:col-span-2">
                  <label className="font-medium">Class *</label>
                  <select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  >
                    <option value="">
                      {loadingClasses ? "Loading classes..." : "Select a Class"}
                    </option>

                    {!loadingClasses &&
                      classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.class_name || cls.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </Card>


            {/* Section 2: Personal/Contact/Location/Address + Actions */}
            <Card className="space-y-10 rounded-3xl p-6 shadow-lg transition duration-300 hover:shadow-xl">
              <div>
                <CardTitle className="mb-4 text-2xl font-bold text-foreground/80">
                  Personal Information
                </CardTitle>

                <div className="grid grid-cols-1 gap-6 text-muted-foreground md:grid-cols-3">
                  <div>
                    <label className="font-medium">Date of Birth *</label>
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
                    <label className="font-medium">Gender *</label>
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
                  </div>

                  <div>
                    <label className="font-medium">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={inputClasses}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="blocked">Blocked</option>
                      <option value="deleted">Deleted</option>
                    </select>
                  </div>
                </div>
              </div>

             

                <div className="grid grid-cols-1 gap-6 text-muted-foreground md:grid-cols-3">
                  <div>
                    <label className="font-medium">Primary Mobile *</label>
                    <input
                      type="text"
                      name="primary_mobile"
                      value={formData.primary_mobile}
                      onChange={handleChange}
                      required
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="font-medium">Secondary Mobile</label>
                    <input
                      type="text"
                      name="secondary_mobile"
                      value={formData.secondary_mobile}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="font-medium">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                  </div>
                </div>
             

             

                <div className="grid grid-cols-1 gap-6 text-muted-foreground md:grid-cols-3">
                  <div>
                    <label className="font-medium">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="font-medium">Current Province</label>
                    <input
                      type="text"
                      name="current_province"
                      value={formData.current_province}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="font-medium">Main Province</label>
                    <input
                      type="text"
                      name="main_province"
                      value={formData.main_province}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                  </div>
                </div>
              

              <div>
                <CardTitle className="text-2xl font-bold text-foreground/80">Address</CardTitle>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`${inputClasses} mt-3 min-h-[110px]`}
                  placeholder="Enter address..."
                />
              </div>

              <div className="flex flex-col justify-between gap-4 pt-4 md:flex-row">
                <Button
                  type="button"
                  className="bg-destructive px-12 text-white hover:bg-destructive/90"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary px-12 text-white hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Add Student"}
                </Button>
              </div>
            </Card>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

