import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CreateVisitorInput,
  PaginatedData,
  PaginationParams,
  UpdateVisitorInput,
  VisitorDTO,
} from "@/types";

export class SasaranService {
  static async getAll(params: PaginationParams): Promise<PaginatedData<VisitorDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.VisitorWhereInput = {};

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { nik: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
        { qrCode: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.visitor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: { id: true, name: true, description: true },
          },
        },
      }),
      prisma.visitor.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items as unknown as VisitorDTO[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  static async getSummaryStats() {
    const total = await prisma.visitor.count({ where: { isActive: true } });
    const categoryCounts = await prisma.visitor.groupBy({
      by: ["categoryId"],
      where: { isActive: true },
      _count: { id: true },
    });

    const countsMap: Record<number, number> = {};
    categoryCounts.forEach((c) => {
      countsMap[c.categoryId] = c._count.id;
    });

    const balita = countsMap[1] || 0;
    const bumil = countsMap[2] || 0;
    const remaja = countsMap[3] || 0;
    const produktif = countsMap[4] || 0;
    const lansia = countsMap[5] || 0;
    const lansiaProduktif = produktif + lansia;

    const calcPct = (cnt: number) => (total > 0 ? Math.round((cnt / total) * 100) : 0);

    return {
      total,
      balita: { count: balita, percentage: calcPct(balita) },
      bumil: { count: bumil, percentage: calcPct(bumil) },
      remaja: { count: remaja, percentage: calcPct(remaja) },
      lansiaProduktif: { count: lansiaProduktif, percentage: calcPct(lansiaProduktif) },
      produktif: { count: produktif, percentage: calcPct(produktif) },
      lansia: { count: lansia, percentage: calcPct(lansia) },
    };
  }

  static async getById(id: number): Promise<VisitorDTO | null> {
    const visitor = await prisma.visitor.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });
    return visitor as unknown as VisitorDTO | null;
  }

  static async create(data: CreateVisitorInput): Promise<VisitorDTO> {
    if (data.nik && data.nik.trim()) {
      const existingNIK = await prisma.visitor.findUnique({
        where: { nik: data.nik.trim() },
      });
      if (existingNIK) {
        throw new Error("NIK sudah terdaftar dalam sistem.");
      }
    }

    // Generate kode QR Unik untuk visitor
    const timestamp = Date.now().toString().slice(-6);
    const qrCode = `QR-VSTR-${data.categoryId}-${timestamp}`;

    const newVisitor = await prisma.visitor.create({
      data: {
        categoryId: data.categoryId,
        nik: data.nik ? data.nik.trim() : null,
        fullName: data.fullName.trim(),
        gender: data.gender,
        birthPlace: data.birthPlace ? data.birthPlace.trim() : null,
        birthDate: new Date(data.birthDate),
        phone: data.phone ? data.phone.trim() : null,
        address: data.address ? data.address.trim() : null,
        photo: data.photo || null,
        qrCode,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    return newVisitor as unknown as VisitorDTO;
  }

  static async update(id: number, data: UpdateVisitorInput): Promise<VisitorDTO> {
    const existing = await prisma.visitor.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Data sasaran tidak ditemukan.");
    }

    if (data.nik && data.nik.trim() !== existing.nik) {
      const nikExists = await prisma.visitor.findUnique({
        where: { nik: data.nik.trim() },
      });
      if (nikExists) {
        throw new Error("NIK sudah terdaftar pada sasaran lain.");
      }
    }

    const updated = await prisma.visitor.update({
      where: { id },
      data: {
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.nik !== undefined && { nik: data.nik ? data.nik.trim() : null }),
        ...(data.fullName && { fullName: data.fullName.trim() }),
        ...(data.gender && { gender: data.gender }),
        ...(data.birthPlace !== undefined && {
          birthPlace: data.birthPlace ? data.birthPlace.trim() : null,
        }),
        ...(data.birthDate && { birthDate: new Date(data.birthDate) }),
        ...(data.phone !== undefined && { phone: data.phone ? data.phone.trim() : null }),
        ...(data.address !== undefined && {
          address: data.address ? data.address.trim() : null,
        }),
        ...(data.photo !== undefined && { photo: data.photo }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        category: true,
      },
    });

    return updated as unknown as VisitorDTO;
  }

  static async delete(id: number): Promise<boolean> {
    const existing = await prisma.visitor.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Data sasaran tidak ditemukan.");
    }
    // Soft delete dengan menonaktifkan isActive = false
    await prisma.visitor.update({
      where: { id },
      data: { isActive: false },
    });
    return true;
  }

  static async getCategories() {
    return prisma.category.findMany({
      orderBy: { id: "asc" },
    });
  }
}
