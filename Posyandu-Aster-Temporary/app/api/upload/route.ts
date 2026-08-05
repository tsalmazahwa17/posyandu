import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { randomUUID } from "crypto";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { uploadToSupabaseStorage } from "@/lib/supabase/admin";

// Ukuran maksimal file
const MAX_FILE_SIZE = 10 * 1024 * 1024;           // 10 MB (default)
const MAX_SPREADSHEET_SIZE = 20 * 1024 * 1024;    // 20 MB (untuk Excel/CSV di arsip)

// Ekstensi yang diizinkan per kategori
const ALLOWED_IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif"];
const ALLOWED_DOC_EXTS = ["pdf", "doc", "docx"];
const ALLOWED_VIDEO_EXTS = ["mp4", "webm", "mov"];
// Excel & CSV hanya untuk folder arsip
const ALLOWED_SPREADSHEET_EXTS = ["xls", "xlsx", "csv"];
const ALL_ALLOWED_EXTS = [...ALLOWED_IMAGE_EXTS, ...ALLOWED_DOC_EXTS, ...ALLOWED_VIDEO_EXTS];
const ARSIP_ALLOWED_EXTS = [...ALL_ALLOWED_EXTS, ...ALLOWED_SPREADSHEET_EXTS];

// Whitelist MIME types yang diizinkan
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  gif: ["image/gif"],
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  mp4: ["video/mp4"],
  webm: ["video/webm"],
  mov: ["video/quicktime"],
  // Spreadsheet — hanya diizinkan pada folder arsip
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  csv: ["text/csv", "text/plain", "application/csv", "application/vnd.ms-excel"],
};

// POST /api/upload — Upload file ke Supabase Storage
// multipart/form-data: field "file" wajib, field "folder" opsional (news|produk|dokumentasi|arsip)
export async function POST(request: Request): Promise<NextResponse> {
  // Rate Limiting (Maksimal 20 upload per menit per IP)
  const rateLimit = await checkRateLimit("upload", request, 20, 60 * 1000);
  if (rateLimit.isLimited) {
    return rateLimitResponse(rateLimit.resetInSeconds);
  }

  try {
    // 1. Autentikasi — hanya user terautentikasi yang boleh mengupload
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    // 2. Hanya ADMIN & KADER yang boleh mengupload
    if (session.role !== "ADMIN" && session.role !== "KADER") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Akses ditolak. Hanya Petugas Posyandu yang dapat mengunggah file." },
        { status: 403 }
      );
    }

    // 3. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file || typeof file === "string") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "File tidak ditemukan dalam permintaan upload." },
        { status: 400 }
      );
    }

    // 4. Tentukan subfolder tujuan penyimpanan (diperlukan sebelum validasi ekstensi)
    const validFolders = ["news", "produk", "dokumentasi", "arsip", "profile", "uploads"];
    const targetFolder = validFolders.includes(folder) ? folder : "uploads";
    const isArsip = targetFolder === "arsip";

    // 5. Validasi ekstensi file
    const fileData = file as File;
    const originalName = fileData.name;
    const ext = originalName.split(".").pop()?.toLowerCase() || "";
    const allowedExts = isArsip ? ARSIP_ALLOWED_EXTS : ALL_ALLOWED_EXTS;

    if (!allowedExts.includes(ext)) {
      const extra = isArsip ? ", xls, xlsx, csv" : "";
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Tipe file .${ext} tidak diizinkan${isArsip ? " pada folder arsip" : ""}. Format yang diperbolehkan: ${ALL_ALLOWED_EXTS.join(", ")}${extra}.`,
        },
        { status: 400 }
      );
    }

    // 6. Validasi ukuran file (spreadsheet diizinkan hingga 20 MB)
    const isSpreadsheet = ALLOWED_SPREADSHEET_EXTS.includes(ext);
    const maxSize = isSpreadsheet ? MAX_SPREADSHEET_SIZE : MAX_FILE_SIZE;
    const maxSizeLabel = isSpreadsheet ? "20 MB" : "10 MB";

    if (fileData.size > maxSize) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Ukuran file melebihi batas maksimal ${maxSizeLabel}. Ukuran file saat ini: ${(fileData.size / 1024 / 1024).toFixed(2)} MB.` },
        { status: 400 }
      );
    }

    // 7. Validasi MIME type (cek kesesuaian content type vs ekstensi)
    const allowedMimes = ALLOWED_MIME_TYPES[ext] || [];
    if (fileData.type && !allowedMimes.includes(fileData.type)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `MIME type "${fileData.type}" tidak sesuai dengan ekstensi .${ext}. Kemungkinan file tidak aman.`,
        },
        { status: 400 }
      );
    }

    // 8. Buat path objek acak untuk mencegah bentrok nama dan path traversal.
    const uniqueFilename = `${randomUUID()}.${ext}`;
    const storagePath = `${targetFolder}/${uniqueFilename}`;

    // 9. Simpan file ke Supabase Storage. Arsip memakai bucket private; media publik memakai bucket public.
    const bytes = await fileData.arrayBuffer();
    const uploaded = await uploadToSupabaseStorage({
      path: storagePath,
      body: bytes,
      contentType: fileData.type || ALLOWED_MIME_TYPES[ext]?.[0],
      visibility: isArsip ? "private" : "public",
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          url: uploaded.url,
          filename: uniqueFilename,
          originalName,
          size: fileData.size,
          mimeType: fileData.type,
          folder: targetFolder,
          storagePath: uploaded.path,
          bucket: uploaded.bucket,
          provider: "supabase",
          visibility: uploaded.visibility,
        },
        message: "File berhasil diunggah ke Supabase Storage.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Upload file error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (error as Error)?.message || "Terjadi kesalahan saat mengunggah file.",
      },
      { status: 500 }
    );
  }
}

// GET /api/upload — Informasi endpoint upload
export async function GET(): Promise<NextResponse> {
  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      endpoint: "POST /api/upload",
      method: "multipart/form-data",
      fields: {
        file: "File yang akan diunggah (wajib)",
        folder: "Subfolder tujuan: news | produk | dokumentasi | arsip | profile (opsional, default: uploads)",
      },
      limits: {
        maxSizeDefault: "10 MB",
        maxSizeSpreadsheet: "20 MB (khusus Excel/CSV pada folder arsip)",
        allowedImageFormats: ALLOWED_IMAGE_EXTS,
        allowedDocFormats: ALLOWED_DOC_EXTS,
        allowedVideoFormats: ALLOWED_VIDEO_EXTS,
        allowedSpreadsheetFormats: `${ALLOWED_SPREADSHEET_EXTS.join(", ")} (hanya folder arsip)`,
      },
      storage: "Supabase Storage (media public, arsip private dengan signed URL)",
      access: "Memerlukan sesi login aktif dengan role ADMIN atau KADER.",
    },
  });
}
