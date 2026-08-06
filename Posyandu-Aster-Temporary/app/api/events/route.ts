import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types";

// GET /api/events
export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all | upcoming | past
    const search = searchParams.get("search") || "";

    const now = new Date();
    const where: Record<string, unknown> = {};

    if (search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { location: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (filter === "upcoming") {
      where.startDate = { gte: now };
    } else if (filter === "past") {
      where.startDate = { lt: now };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: filter === "past" ? "desc" : "asc" },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: events });
  } catch (error: unknown) {
    console.error("GET /api/events error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

// POST /api/events
export async function POST(request: Request) {
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
        { success: false, error: "Akses ditolak. Hanya ADMIN dan KADER yang dapat mengelola jadwal." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, location, startDate, endDate, isPublished } = body;

    if (!title || !title.trim()) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Judul jadwal wajib diisi." },
        { status: 400 }
      );
    }
    if (!startDate) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Tanggal mulai wajib diisi." },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isPublished: isPublished !== false,
      },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: event, message: "Jadwal berhasil ditambahkan." },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/events error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
