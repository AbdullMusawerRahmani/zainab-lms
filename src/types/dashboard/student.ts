export type Student = {
  id: string;
  first_name: string;
  last_name: string;
  father_name: string;
  grand_father_name: string;
  image: string | File;
  dob: string;
  age: string;
  gender: "male" | "female";
  address: string;
  primary_mobile: string;
  secondary_mobile?: string;
  email: string;
  status: "active" | "inactive" | "pending" | "blocked" | "deleted";
  country: string;
  current_province: string;
  main_province: string;
  class_id: string;
};



export type Attendance = {
  id: string;
  attendance_date: string;
  attendance_status: "present" | "absent" | "late" | "excused";
  notes?: string;

  student_id: string;
  class_id: string;
  recorded_by: number | null;

  student_info: {
    first_name: string;
    father_name: string;
  };

  class_info: {
    id: string;
    name: string;
    level: string;
    status: "active" | "inactive";
  };
};
