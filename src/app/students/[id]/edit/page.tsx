"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchStudentById, patchStudent } from "@/app/actions/students/Student-services";
import { fetchClasses } from "@/app/actions/classes/class-services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditStudentPage() {
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
    grand_father_name: "",
    dob: "",
    age: "",
    gender: "male",
    address: "",
    primary_mobile: "",
    secondary_mobile: "",
    email: "",
    status: "active",
    country: "",
    current_province: "",
    main_province: "",
    class_id: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await fetchClasses();
        setClasses(res);
      } catch (err: any) {
        toast.error(err.message || "Failed to load classes");
      } finally {
        setLoadingClasses(false);
      }
    };
    loadClasses();
  }, []);

  // Load student data
  useEffect(() => {
    if (!id) return;
    const loadStudent = async () => {
      try {
        const data = await fetchStudentById(id);
        setFormData({
          ...data,
          class_id: data.class_id ?? "",
          image: null,
        });
        setImagePreview(data.image || null);
      } catch (err: any) {
        toast.error(err.message || "Failed to load student");
      } finally {
        setLoading(false);
      }
    };
    loadStudent();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      if (formData.image) fd.append("image", formData.image);

      await patchStudent(id!, fd); // Make sure your patchStudent can handle FormData
      toast.success("Student updated successfully!");
      router.push("/students");
    } catch (err: any) {
      toast.error(err.message || "Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-4">Loading student...</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Edit Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">

            {/* Section 1: Photo + Basic Info */}
            <Card className="rounded-3xl p-8 shadow-xl transition duration-300 hover:shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* Photo */}
                <div>
                  <CardTitle className="mb-4 text-2xl font-bold text-foreground/80">Student Photo</CardTitle>
                  <input type="file" name="image" id="imageInput" onChange={handleFileChange} className="hidden" />
                  <div
                    onClick={() => document.getElementById("imageInput")?.click()}
                    className="flex h-72 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition hover:border-blue-500 hover:bg-blue-50 dark:border-neutral-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      <span className="text-sm text-muted-foreground">Click to upload student photo</span>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div>
                  <CardTitle className="mb-4 text-2xl font-bold text-foreground/80">Basic Information</CardTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-muted-foreground">

                    <div>
                      <label className="font-medium">First Name *</label>
                      <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className={inputClasses} />
                    </div>

                    <div>
                      <label className="font-medium">Last Name *</label>
                      <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className={inputClasses} />
                    </div>

                    <div>
                      <label className="font-medium">Father Name</label>
                      <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className={inputClasses} />
                    </div>

                    <div>
                      <label className="font-medium">Grand Father Name</label>
                      <input type="text" name="grand_father_name" value={formData.grand_father_name} onChange={handleChange} className={inputClasses} />
                    </div>

                    <div>
                      <label className="font-medium">Age</label>
                      <input type="text" name="age" value={formData.age} onChange={handleChange} className={inputClasses} />
                    </div>

                    <div >
                      <label className="font-medium">Class *</label>
                      <select name="class_id" value={formData.class_id} onChange={handleChange} className={inputClasses}>
                        <option value="">{loadingClasses ? "Loading classes..." : "Select a Class"}</option>
                        {!loadingClasses && classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>

                  </div>
                </div>
              </div>
            </Card>

            {/* Section 2: Personal/Contact/Location/Address */}
            <Card className="space-y-10 rounded-3xl p-6 shadow-lg transition duration-300 hover:shadow-xl">

              {/* Personal Info */}
              <div>
                <CardTitle className="mb-4 text-2xl font-bold text-foreground/80">Personal Information</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-muted-foreground">
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClasses} required />
                  <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <select name="status" value={formData.status} onChange={handleChange} className={inputClasses}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="blocked">Blocked</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-muted-foreground">
                <input type="text" name="primary_mobile" value={formData.primary_mobile} onChange={handleChange} placeholder="Primary Mobile" className={inputClasses} required />
                <input type="text" name="secondary_mobile" value={formData.secondary_mobile} onChange={handleChange} placeholder="Secondary Mobile" className={inputClasses} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className={inputClasses} />
              </div>

              {/* Location Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-muted-foreground">
                <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" className={inputClasses} />
                <input type="text" name="current_province" value={formData.current_province} onChange={handleChange} placeholder="Current Province" className={inputClasses} />
                <input type="text" name="main_province" value={formData.main_province} onChange={handleChange} placeholder="Main Province" className={inputClasses} />
              </div>

              {/* Address */}
              <div>
                <CardTitle className="text-2xl font-bold text-foreground/80">Address</CardTitle>
                <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter address..." className={`${inputClasses} mt-3 min-h-[110px]`} />
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row justify-between gap-4 pt-4">
                <Button type="button" className="bg-destructive px-12 text-white hover:bg-destructive/90" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" className="bg-primary px-12 text-white hover:bg-primary/90" disabled={saving}>
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
