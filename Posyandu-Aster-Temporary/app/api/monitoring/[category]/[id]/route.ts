import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { MonitoringService } from "@/services/monitoring.service";
import { ApiResponse } from "@/types";

// PUT / PATCH / DELETE endpoint per category record
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ category: string; id: string }> }
) {
  return handleUpdate(request, params);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ category: string; id: string }> }
) {
  return handleUpdate(request, params);
}

async function handleUpdate(
  request: Request,
  paramsPromise: Promise<{ category: string; id: string }>
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

    const { category, id } = await paramsPromise;
    const cat = category.toLowerCase().trim();
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    let updatedRecord;

    switch (cat) {
      case "balita": {
        const data: Record<string, unknown> = {};
        if (body.examinationDate) data.examinationDate = new Date(body.examinationDate);
        if (body.ageMonth !== undefined) data.ageMonth = parseInt(body.ageMonth);
        if (body.monthNumber !== undefined) data.monthNumber = parseInt(body.monthNumber);
        if (body.weight !== undefined) data.weight = parseFloat(body.weight);
        if (body.height !== undefined) data.height = parseFloat(body.height);
        if (body.headCircumference !== undefined)
          data.headCircumference = body.headCircumference ? parseFloat(body.headCircumference) : null;
        if (body.nutritionalStatus !== undefined) data.nutritionalStatus = body.nutritionalStatus || null;
        if (body.notes !== undefined) data.notes = body.notes || null;
        updatedRecord = await MonitoringService.updateBalita(recordId, data);
        break;
      }
      case "bumil":
      case "ibu-hamil": {
        const data: Record<string, unknown> = {};
        if (body.examinationDate) data.examinationDate = new Date(body.examinationDate);
        if (body.gestationalAge !== undefined) data.gestationalAge = body.gestationalAge ? parseFloat(body.gestationalAge) : null;
        if (body.weight !== undefined) data.weight = body.weight ? parseFloat(body.weight) : null;
        if (body.systolicBP !== undefined) data.systolicBP = body.systolicBP ? parseFloat(body.systolicBP) : null;
        if (body.diastolicBP !== undefined) data.diastolicBP = body.diastolicBP ? parseFloat(body.diastolicBP) : null;
        if (body.hb !== undefined) data.hb = body.hb ? parseFloat(body.hb) : null;
        if (body.lila !== undefined) data.lila = body.lila ? parseFloat(body.lila) : null;
        if (body.notes !== undefined) data.notes = body.notes || null;
        updatedRecord = await MonitoringService.updateIbuHamil(recordId, data);
        break;
      }
      case "remaja": {
        const data: Record<string, unknown> = {};
        if (body.examinationDate) data.examinationDate = new Date(body.examinationDate);
        if (body.weight !== undefined) data.weight = body.weight ? parseFloat(body.weight) : null;
        if (body.height !== undefined) data.height = body.height ? parseFloat(body.height) : null;
        if (body.armCircumference !== undefined) data.armCircumference = body.armCircumference ? parseFloat(body.armCircumference) : null;
        if (body.hb !== undefined) data.hb = body.hb ? parseFloat(body.hb) : null;
        if (body.notes !== undefined) data.notes = body.notes || null;
        updatedRecord = await MonitoringService.updateRemaja(recordId, data);
        break;
      }
      case "produktif":
      case "usia-produktif": {
        const data: Record<string, unknown> = {};
        if (body.examinationDate) data.examinationDate = new Date(body.examinationDate);
        if (body.weight !== undefined) data.weight = body.weight ? parseFloat(body.weight) : null;
        if (body.height !== undefined) data.height = body.height ? parseFloat(body.height) : null;
        if (body.bmi !== undefined) data.bmi = body.bmi ? parseFloat(body.bmi) : null;
        if (body.waistCircumference !== undefined) data.waistCircumference = body.waistCircumference ? parseFloat(body.waistCircumference) : null;
        if (body.systolicBP !== undefined) data.systolicBP = body.systolicBP ? parseFloat(body.systolicBP) : null;
        if (body.diastolicBP !== undefined) data.diastolicBP = body.diastolicBP ? parseFloat(body.diastolicBP) : null;
        if (body.bloodSugar !== undefined) data.bloodSugar = body.bloodSugar ? parseFloat(body.bloodSugar) : null;
        if (body.cholesterol !== undefined) data.cholesterol = body.cholesterol ? parseFloat(body.cholesterol) : null;
        if (body.notes !== undefined) data.notes = body.notes || null;
        updatedRecord = await MonitoringService.updateUsiaProduktif(recordId, data);
        break;
      }
      case "lansia": {
        const data: Record<string, unknown> = {};
        if (body.examinationDate) data.examinationDate = new Date(body.examinationDate);
        if (body.weight !== undefined) data.weight = body.weight ? parseFloat(body.weight) : null;
        if (body.systolicBP !== undefined) data.systolicBP = body.systolicBP ? parseFloat(body.systolicBP) : null;
        if (body.diastolicBP !== undefined) data.diastolicBP = body.diastolicBP ? parseFloat(body.diastolicBP) : null;
        if (body.bloodSugar !== undefined) data.bloodSugar = body.bloodSugar ? parseFloat(body.bloodSugar) : null;
        if (body.cholesterol !== undefined) data.cholesterol = body.cholesterol ? parseFloat(body.cholesterol) : null;
        if (body.uricAcid !== undefined) data.uricAcid = body.uricAcid ? parseFloat(body.uricAcid) : null;
        if (body.notes !== undefined) data.notes = body.notes || null;
        updatedRecord = await MonitoringService.updateLansia(recordId, data);
        break;
      }
      default:
        return NextResponse.json<ApiResponse>(
          { success: false, error: `Kategori '${cat}' tidak valid.` },
          { status: 400 }
        );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedRecord,
      message: "Data pemeriksaan berhasil diperbarui.",
    });
  } catch (error: unknown) {
    console.error("Update monitoring record error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

// DELETE /api/monitoring/[category]/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ category: string; id: string }> }
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

    const { category, id } = await params;
    const cat = category.toLowerCase().trim();
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID tidak valid." },
        { status: 400 }
      );
    }

    switch (cat) {
      case "balita":
        await MonitoringService.deleteBalita(recordId);
        break;
      case "bumil":
      case "ibu-hamil":
        await MonitoringService.deleteIbuHamil(recordId);
        break;
      case "remaja":
        await MonitoringService.deleteRemaja(recordId);
        break;
      case "produktif":
      case "usia-produktif":
        await MonitoringService.deleteUsiaProduktif(recordId);
        break;
      case "lansia":
        await MonitoringService.deleteLansia(recordId);
        break;
      default:
        return NextResponse.json<ApiResponse>(
          { success: false, error: `Kategori '${cat}' tidak valid.` },
          { status: 400 }
        );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Data pemeriksaan berhasil dihapus.",
    });
  } catch (error: unknown) {
    console.error("Delete monitoring record error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: (error as Error)?.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
