export type Gender = "male" | "female";
export type EmployeeStatus = "active" | "inactive";

export interface Employee {
  id?: string;

  first_name: string;
  last_name: string;
  father_name: string;
  grand_father_name: string;

  image?: string | File;

  dob: string; // YYYY-MM-DD
  gender: Gender;

  address: string;

  primary_mobile: string;
  secondary_mobile?: string;

  email: string;

  status: EmployeeStatus;

  country: string;
  current_province: string;
  main_province: string;
}
