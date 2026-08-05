import { MediaType } from "@prisma/client";

// ============================================================================
// 1. BERITA (NEWS)
// ============================================================================

export interface NewsCategory {
  id: number;
  name: string;
  description?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NewsItem {
  id: number;
  categoryId: number;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string | null;
  authorId: number;
  isPublished: boolean;
  publishedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  category?: NewsCategory;
  author?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export interface CreateNewsDTO {
  categoryId: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  isPublished?: boolean;
}

export interface UpdateNewsDTO extends Partial<CreateNewsDTO> {}

// ============================================================================
// 2. DOKUMENTASI (DOCUMENTATION / GALLERY)
// ============================================================================

export interface DocumentationCategory {
  id: number;
  name: string;
  description?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DocumentationItem {
  id: number;
  categoryId: number;
  title: string;
  description?: string | null;
  mediaUrl: string;
  mediaType: MediaType | "PHOTO" | "VIDEO";
  uploadedBy: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  category?: DocumentationCategory;
  uploader?: {
    id: number;
    fullName: string;
  };
}

export interface CreateDocumentationDTO {
  categoryId: number;
  title: string;
  description?: string | null;
  mediaUrl: string;
  mediaType: "PHOTO" | "VIDEO";
}

export interface UpdateDocumentationDTO extends Partial<CreateDocumentationDTO> {}

// ============================================================================
// 3. PRODUK UMKM POSYANDU (PRODUCT)
// ============================================================================

export interface ProductCategory {
  id: number;
  name: string;
  description?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProductItem {
  id: number;
  categoryId: number;
  name: string;
  description?: string | null;
  price: number;
  contactPhone?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  category?: ProductCategory;
}

export interface CreateProductDTO {
  categoryId: number;
  name: string;
  description?: string | null;
  price: number;
  contactPhone?: string | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

// ============================================================================
// 4. ARSIP DIGITAL / DOKUMEN SOP (ARCHIVE)
// ============================================================================

export interface ArchiveCategory {
  id: number;
  name: string;
  description?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ArchiveItem {
  id: number;
  categoryId: number;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileSize?: number | null;
  fileType?: string | null;
  uploadedBy: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  category?: ArchiveCategory;
  uploader?: {
    id: number;
    fullName: string;
  };
}

export interface CreateArchiveDTO {
  categoryId: number;
  title: string;
  description?: string | null;
  fileUrl: string;
}

export interface UpdateArchiveDTO extends Partial<CreateArchiveDTO> {}
