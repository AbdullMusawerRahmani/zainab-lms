export type ClassItem = {
  id?: string;
  name: string;
  level: string;
  status: "active" | "inactive" | string;
  created_at?: string;
  updated_at?: string;
};
