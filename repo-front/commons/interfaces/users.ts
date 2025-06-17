export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MANAGER = "manager",
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
