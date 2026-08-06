import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { MonitoringService } from "@/services/monitoring.service";
import { z } from "zod";
import { ApiResponse } from "@/types";

// Validation schemas per category
const balitaSchema = z.object({
  visitorId: z.number(),
  examinationDate: z.string(),
  monthNumber: z.number().int(),
  ageMonth: z.number().int(),
  weight: z.number().positive("Berat badan harus lebih dari 0."),
  height: z.number().positive("Tinggi badan harus lebih dari 0."),
  headCircumference: z.number().optional().nullable(),
  nutritionalStatus: z.string().optional().nullable(),
  immunization: z.string().optional().nullable(),
  vitamin: z.string().optional().nullable(),
  kpspResult: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const bumilSchema = z.object({
  visitorId: z.number(),
  examinationDate: z.string(),
  gestationalAge: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  systolicBP: z.number().optional().nullable(),
  diastolicBP: z.number().optional().nullable(),
  hb: z.number().optional().nullable(),
  lila: z.number().optional().nullable(),
  hpht: z.string().optional().nullable(),
  hpl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const remajaSchema = z.object({
  visitorId: z.number(),
  examinationDate: z.string(),
  weight: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  armCircumference: z.number().optional().nullable(),
  hb: z.number().optional().nullable(),
  anemiaStatus: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const produktifSchema = z.object({
  visitorId: z.number(),
  examinationDate: z.string(),
  weight: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  bmi: z.number().optional().nullable(),
  waistCircumference: z.number().optional().nullable(),
  systolicBP: z.number().optional().nullable(),
  diastolicBP: z.number().optional().nullable(),
  bloodSugar: z.number().optional().nullable(),
  cholesterol: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const lansiaSchema = z.object({
  visitorId: z.number(),
  examinationDate: z.string(),
  weight: z.number().optional().nullable(),
  systolicBP: z.number().optional().nullable(),
  diastolicBP: z.number().optional().nullable(),
  bloodSugar: z.number().optional().nullable(),
  cholesterol: z.number().optional().nullable(),
  uricAcid: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// GET /api/monitoring/[category]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    const { category } = await params;
    const cat = category.toLowerCase().trim();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const queryParams = { page, limit, search };

    let data;
    switch (cat) {
      case "balita":
        data = await MonitoringService.getBalitaList(queryParams);
        break;
      case "bumil":
      case "ibu-hamil":
        data = await MonitoringService.getIbuHamilList(queryParams);
        break;
      case "remaja":
        data = await MonitoringService.getRemajaList(queryParams);
        break;
      case "produktif":
      case "usia-produktif":
        data = await MonitoringService.getUsiaProduktifList(queryParams);
        break;
      case "lansia":
        data = await MonitoringService.getLansiaList(queryParams);
        break;
      default:
        return NextResponse.json<ApiResponse>(
          { success: false, error: `Kategori monitoring '${cat}' tidak valid.` },
          { status: 400 }
        );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("Get monitoring error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (error as Error)?.message || "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

// POST /api/monitoring/[category]
export async function POST(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN" && session.role !== "KADER") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Akses ditolak." },
        { status: 403 }
      );
    }

    const { category } = await params;
    const cat = category.toLowerCase().trim();
    const body = await request.json();

    let createdRecord;
    switch (cat) {
      case "balita": {
        const val = balitaSchema.safeParse(body);
        if (!val.success) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: val.error.issues[0]?.message || "Input tidak valid." },
            { status: 400 }
          );
        }
        // Check duplicate date (same visitor + same date)
        if (!body.forceNew) {
          const { prisma } = await import("@/lib/prisma");
          const existing = await prisma.monitoringBalita.findFirst({
            where: {
              visitorId: val.data.visitorId,
              examinationDate: new Date(val.data.examinationDate),
            },
            select: { id: true, examinationDate: true },
          });
          if (existing) {
            return NextResponse.json<ApiResponse>(
              {
                success: false,
                error: "Sudah ada data pemeriksaan pada tanggal ini.",
                data: { conflictId: existing.id, conflictDate: existing.examinationDate },
              },
              { status: 409 }
            );
          }
        }
        createdRecord = await MonitoringService.createBalita(val.data, session.userId);
        break;
      }
      case "bumil":
      case "ibu-hamil": {
        const val = bumilSchema.safeParse(body);
        if (!val.success) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: val.error.issues[0]?.message || "Input tidak valid." },
            { status: 400 }
          );
        }
        if (!body.forceNew) {
          const { prisma } = await import("@/lib/prisma");
          const existing = await prisma.monitoringIbuHamil.findFirst({
            where: {
              visitorId: val.data.visitorId,
              examinationDate: new Date(val.data.examinationDate),
            },
            select: { id: true, examinationDate: true },
          });
          if (existing) {
            return NextResponse.json<ApiResponse>(
              {
                success: false,
                error: "Sudah ada data pemeriksaan pada tanggal ini.",
                data: { conflictId: existing.id, conflictDate: existing.examinationDate },
              },
              { status: 409 }
            );
          }
        }
        createdRecord = await MonitoringService.createIbuHamil(val.data, session.userId);
        break;
      }
      case "remaja": {
        const val = remajaSchema.safeParse(body);
        if (!val.success) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: val.error.issues[0]?.message || "Input tidak valid." },
            { status: 400 }
          );
        }
        if (!body.forceNew) {
          const { prisma } = await import("@/lib/prisma");
          const existing = await prisma.monitoringRemaja.findFirst({
            where: {
              visitorId: val.data.visitorId,
              examinationDate: new Date(val.data.examinationDate),
            },
            select: { id: true, examinationDate: true },
          });
          if (existing) {
            return NextResponse.json<ApiResponse>(
              {
                success: false,
                error: "Sudah ada data pemeriksaan pada tanggal ini.",
                data: { conflictId: existing.id, conflictDate: existing.examinationDate },
              },
              { status: 409 }
            );
          }
        }
        createdRecord = await MonitoringService.createRemaja(val.data, session.userId);
        break;
      }
      case "produktif":
      case "usia-produktif": {
        const val = produktifSchema.safeParse(body);
        if (!val.success) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: val.error.issues[0]?.message || "Input tidak valid." },
            { status: 400 }
          );
        }
        if (!body.forceNew) {
          const { prisma } = await import("@/lib/prisma");
          const existing = await prisma.monitoringUsiaProduktif.findFirst({
            where: {
              visitorId: val.data.visitorId,
              examinationDate: new Date(val.data.examinationDate),
            },
            select: { id: true, examinationDate: true },
          });
          if (existing) {
            return NextResponse.json<ApiResponse>(
              {
                success: false,
                error: "Sudah ada data pemeriksaan pada tanggal ini.",
                data: { conflictId: existing.id, conflictDate: existing.examinationDate },
              },
              { status: 409 }
            );
          }
        }
        createdRecord = await MonitoringService.createUsiaProduktif(val.data, session.userId);
        break;
      }
      case "lansia": {
        const val = lansiaSchema.safeParse(body);
        if (!val.success) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: val.error.issues[0]?.message || "Input tidak valid." },
            { status: 400 }
          );
        }
        if (!body.forceNew) {
          const { prisma } = await import("@/lib/prisma");
          const existing = await prisma.monitoringLansia.findFirst({
            where: {
              visitorId: val.data.visitorId,
              examinationDate: new Date(val.data.examinationDate),
            },
            select: { id: true, examinationDate: true },
          });
          if (existing) {
            return NextResponse.json<ApiResponse>(
              {
                success: false,
                error: "Sudah ada data pemeriksaan pada tanggal ini.",
                data: { conflictId: existing.id, conflictDate: existing.examinationDate },
              },
              { status: 409 }
            );
          }
        }
        createdRecord = await MonitoringService.createLansia(val.data, session.userId);
        break;
      }
      default:
        return NextResponse.json<ApiResponse>(
          { success: false, error: `Kategori monitoring '${cat}' tidak valid.` },
          { status: 400 }
        );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: createdRecord,
        message: "Data pemeriksaan kesehatan berhasil dicatat.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create monitoring error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (error as Error)?.message || "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}
