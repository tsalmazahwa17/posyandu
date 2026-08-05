import { Gender } from "@prisma/client";

export interface VisitorDTO {
  id: number;
  categoryId: number;
  nik?: string | null;
  fullName: string;
  gender: Gender;
  birthPlace?: string | null;
  birthDate: Date | string;
  phone?: string | null;
  address?: string | null;
  qrCode?: string | null;
  photo?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
  category?: {
    id: number;
    name: string;
    description?: string | null;
  };
  user?: {
    id: number;
    email: string;
    role: string;
  } | null;
}

export interface CreateVisitorInput {
  categoryId: number;
  nik?: string | null;
  fullName: string;
  gender: Gender;
  birthPlace?: string | null;
  birthDate: Date | string;
  phone?: string | null;
  address?: string | null;
  photo?: string | null;
}

export interface UpdateVisitorInput {
  categoryId?: number;
  nik?: string | null;
  fullName?: string;
  gender?: Gender;
  birthPlace?: string | null;
  birthDate?: Date | string;
  phone?: string | null;
  address?: string | null;
  photo?: string | null;
  isActive?: boolean;
}
