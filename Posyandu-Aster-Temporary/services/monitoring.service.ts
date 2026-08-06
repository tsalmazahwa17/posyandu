import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CreateBalitaInput,
  CreateIbuHamilInput,
  CreateLansiaInput,
  CreateRemajaInput,
  CreateUsiaProduktifInput,
  MonitoringBalitaDTO,
  MonitoringIbuHamilDTO,
  MonitoringLansiaDTO,
  MonitoringRemajaDTO,
  MonitoringUsiaProduktifDTO,
  PaginatedData,
  PaginationParams,
} from "@/types";

export class MonitoringService {
  // ─── BALITA ────────────────────────────────────────────────────────────────
  static async getBalitaList(params: PaginationParams): Promise<PaginatedData<MonitoringBalitaDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.MonitoringBalitaWhereInput = {};
    if (params.search && params.search.trim()) {
      where.visitor = {
        fullName: { contains: params.search.trim(), mode: "insensitive" },
      };
    }

    const [items, total] = await Promise.all([
      prisma.monitoringBalita.findMany({
        where,
        skip,
        take: limit,
        orderBy: { examinationDate: "desc" },
        include: {
          visitor: { select: { id: true, fullName: true, nik: true, birthDate: true } },
          recorder: { select: { id: true, fullName: true } },
        },
      }),
      prisma.monitoringBalita.count({ where }),
    ]);

    return {
      items: items as unknown as MonitoringBalitaDTO[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async createBalita(data: CreateBalitaInput, recordedBy: number): Promise<MonitoringBalitaDTO> {
    const record = await prisma.monitoringBalita.create({
      data: {
        visitorId: data.visitorId,
        recordedBy,
        examinationDate: new Date(data.examinationDate),
        monthNumber: data.monthNumber,
        ageMonth: data.ageMonth,
        weight: data.weight,
        height: data.height,
        headCircumference: data.headCircumference || null,
        nutritionalStatus: data.nutritionalStatus || null,
        immunization: data.immunization || null,
        vitamin: data.vitamin || null,
        kpspResult: data.kpspResult || null,
        notes: data.notes || null,
      },
      include: {
        visitor: { select: { id: true, fullName: true, nik: true } },
      },
    });
    return record as unknown as MonitoringBalitaDTO;
  }

  // ─── IBU HAMIL ─────────────────────────────────────────────────────────────
  static async getIbuHamilList(params: PaginationParams): Promise<PaginatedData<MonitoringIbuHamilDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.MonitoringIbuHamilWhereInput = {};
    if (params.search && params.search.trim()) {
      where.visitor = {
        fullName: { contains: params.search.trim(), mode: "insensitive" },
      };
    }

    const [items, total] = await Promise.all([
      prisma.monitoringIbuHamil.findMany({
        where,
        skip,
        take: limit,
        orderBy: { examinationDate: "desc" },
        include: {
          visitor: { select: { id: true, fullName: true, nik: true, birthDate: true } },
          recorder: { select: { id: true, fullName: true } },
        },
      }),
      prisma.monitoringIbuHamil.count({ where }),
    ]);

    return {
      items: items as unknown as MonitoringIbuHamilDTO[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async createIbuHamil(data: CreateIbuHamilInput, recordedBy: number): Promise<MonitoringIbuHamilDTO> {
    const record = await prisma.monitoringIbuHamil.create({
      data: {
        visitorId: data.visitorId,
        recordedBy,
        examinationDate: new Date(data.examinationDate),
        gestationalAge: data.gestationalAge || null,
        weight: data.weight || null,
        systolicBP: data.systolicBP || null,
        diastolicBP: data.diastolicBP || null,
        hb: data.hb || null,
        lila: data.lila || null,
        hpht: data.hpht ? new Date(data.hpht) : null,
        hpl: data.hpl ? new Date(data.hpl) : null,
        notes: data.notes || null,
      },
      include: {
        visitor: { select: { id: true, fullName: true, nik: true } },
      },
    });
    return record as unknown as MonitoringIbuHamilDTO;
  }

  // ─── REMAJA ────────────────────────────────────────────────────────────────
  static async getRemajaList(params: PaginationParams): Promise<PaginatedData<MonitoringRemajaDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.MonitoringRemajaWhereInput = {};
    if (params.search && params.search.trim()) {
      where.visitor = {
        fullName: { contains: params.search.trim(), mode: "insensitive" },
      };
    }

    const [items, total] = await Promise.all([
      prisma.monitoringRemaja.findMany({
        where,
        skip,
        take: limit,
        orderBy: { examinationDate: "desc" },
        include: {
          visitor: { select: { id: true, fullName: true, nik: true } },
          recorder: { select: { id: true, fullName: true } },
        },
      }),
      prisma.monitoringRemaja.count({ where }),
    ]);

    return {
      items: items as unknown as MonitoringRemajaDTO[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async createRemaja(data: CreateRemajaInput, recordedBy: number): Promise<MonitoringRemajaDTO> {
    const record = await prisma.monitoringRemaja.create({
      data: {
        visitorId: data.visitorId,
        recordedBy,
        examinationDate: new Date(data.examinationDate),
        weight: data.weight || null,
        height: data.height || null,
        armCircumference: data.armCircumference || null,
        hb: data.hb || null,
        anemiaStatus: data.anemiaStatus || null,
        notes: data.notes || null,
      },
      include: {
        visitor: { select: { id: true, fullName: true, nik: true } },
      },
    });
    return record as unknown as MonitoringRemajaDTO;
  }

  // ─── USIA PRODUKTIF ────────────────────────────────────────────────────────
  static async getUsiaProduktifList(params: PaginationParams): Promise<PaginatedData<MonitoringUsiaProduktifDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.MonitoringUsiaProduktifWhereInput = {};
    if (params.search && params.search.trim()) {
      where.visitor = {
        fullName: { contains: params.search.trim(), mode: "insensitive" },
      };
    }

    const [items, total] = await Promise.all([
      prisma.monitoringUsiaProduktif.findMany({
        where,
        skip,
        take: limit,
        orderBy: { examinationDate: "desc" },
        include: {
          visitor: { select: { id: true, fullName: true, nik: true } },
          recorder: { select: { id: true, fullName: true } },
        },
      }),
      prisma.monitoringUsiaProduktif.count({ where }),
    ]);

    return {
      items: items as unknown as MonitoringUsiaProduktifDTO[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async createUsiaProduktif(data: CreateUsiaProduktifInput, recordedBy: number): Promise<MonitoringUsiaProduktifDTO> {
    const record = await prisma.monitoringUsiaProduktif.create({
      data: {
        visitorId: data.visitorId,
        recordedBy,
        examinationDate: new Date(data.examinationDate),
        weight: data.weight || null,
        height: data.height || null,
        bmi: data.bmi || null,
        waistCircumference: data.waistCircumference || null,
        systolicBP: data.systolicBP || null,
        diastolicBP: data.diastolicBP || null,
        bloodSugar: data.bloodSugar || null,
        cholesterol: data.cholesterol || null,
        notes: data.notes || null,
      },
      include: {
        visitor: { select: { id: true, fullName: true, nik: true } },
      },
    });
    return record as unknown as MonitoringUsiaProduktifDTO;
  }

  // ─── LANSIA ────────────────────────────────────────────────────────────────
  static async getLansiaList(params: PaginationParams): Promise<PaginatedData<MonitoringLansiaDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.MonitoringLansiaWhereInput = {};
    if (params.search && params.search.trim()) {
      where.visitor = {
        fullName: { contains: params.search.trim(), mode: "insensitive" },
      };
    }

    const [items, total] = await Promise.all([
      prisma.monitoringLansia.findMany({
        where,
        skip,
        take: limit,
        orderBy: { examinationDate: "desc" },
        include: {
          visitor: { select: { id: true, fullName: true, nik: true } },
          recorder: { select: { id: true, fullName: true } },
        },
      }),
      prisma.monitoringLansia.count({ where }),
    ]);

    return {
      items: items as unknown as MonitoringLansiaDTO[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async createLansia(data: CreateLansiaInput, recordedBy: number): Promise<MonitoringLansiaDTO> {
    const record = await prisma.monitoringLansia.create({
      data: {
        visitorId: data.visitorId,
        recordedBy,
        examinationDate: new Date(data.examinationDate),
        weight: data.weight || null,
        systolicBP: data.systolicBP || null,
        diastolicBP: data.diastolicBP || null,
        bloodSugar: data.bloodSugar || null,
        cholesterol: data.cholesterol || null,
        uricAcid: data.uricAcid || null,
        notes: data.notes || null,
      },
      include: {
        visitor: { select: { id: true, fullName: true, nik: true } },
      },
    });
    return record as unknown as MonitoringLansiaDTO;
  }

  // ─── UPDATE & DELETE METHODS ─────────────────────────────────────────────
  static async updateBalita(id: number, data: Prisma.MonitoringBalitaUpdateInput): Promise<MonitoringBalitaDTO> {
    const record = await prisma.monitoringBalita.update({
      where: { id },
      data,
      include: { visitor: { select: { id: true, fullName: true, nik: true } } },
    });
    return record as unknown as MonitoringBalitaDTO;
  }

  static async deleteBalita(id: number): Promise<boolean> {
    await prisma.monitoringBalita.delete({ where: { id } });
    return true;
  }

  static async updateIbuHamil(id: number, data: Prisma.MonitoringIbuHamilUpdateInput): Promise<MonitoringIbuHamilDTO> {
    const record = await prisma.monitoringIbuHamil.update({
      where: { id },
      data,
      include: { visitor: { select: { id: true, fullName: true, nik: true } } },
    });
    return record as unknown as MonitoringIbuHamilDTO;
  }

  static async deleteIbuHamil(id: number): Promise<boolean> {
    await prisma.monitoringIbuHamil.delete({ where: { id } });
    return true;
  }

  static async updateRemaja(id: number, data: Prisma.MonitoringRemajaUpdateInput): Promise<MonitoringRemajaDTO> {
    const record = await prisma.monitoringRemaja.update({
      where: { id },
      data,
      include: { visitor: { select: { id: true, fullName: true, nik: true } } },
    });
    return record as unknown as MonitoringRemajaDTO;
  }

  static async deleteRemaja(id: number): Promise<boolean> {
    await prisma.monitoringRemaja.delete({ where: { id } });
    return true;
  }

  static async updateUsiaProduktif(id: number, data: Prisma.MonitoringUsiaProduktifUpdateInput): Promise<MonitoringUsiaProduktifDTO> {
    const record = await prisma.monitoringUsiaProduktif.update({
      where: { id },
      data,
      include: { visitor: { select: { id: true, fullName: true, nik: true } } },
    });
    return record as unknown as MonitoringUsiaProduktifDTO;
  }

  static async deleteUsiaProduktif(id: number): Promise<boolean> {
    await prisma.monitoringUsiaProduktif.delete({ where: { id } });
    return true;
  }

  static async updateLansia(id: number, data: Prisma.MonitoringLansiaUpdateInput): Promise<MonitoringLansiaDTO> {
    const record = await prisma.monitoringLansia.update({
      where: { id },
      data,
      include: { visitor: { select: { id: true, fullName: true, nik: true } } },
    });
    return record as unknown as MonitoringLansiaDTO;
  }

  static async deleteLansia(id: number): Promise<boolean> {
    await prisma.monitoringLansia.delete({ where: { id } });
    return true;
  }
}
