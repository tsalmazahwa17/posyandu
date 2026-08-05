export type UserRole = "ADMIN" | "KADER" | "MASYARAKAT";

export interface UserDTO {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  passwordChangedAt?: Date | string | null;
  visitorId?: number | null;
  visitor?: {
    id: number;
    fullName: string;
    nik?: string | null;
  } | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  visitorId?: number | null;
}

export interface UpdateUserInput {
  fullName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  visitorId?: number | null;
}
