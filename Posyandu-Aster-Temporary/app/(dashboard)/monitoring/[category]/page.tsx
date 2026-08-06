import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BalitaMonitoringDashboard, {
  type BalitaPerson,
} from "@/components/monitoring/BalitaMonitoringDashboard";
import GenericMonitoringDashboard, {
  type GenericMetric,
  type GenericPerson,
} from "@/components/monitoring/GenericMonitoringDashboard";

export const dynamic = "force-dynamic";

const modules: Record<
  string,
  {
    title: string;
    description: string;
    metrics: GenericMetric[];
  }
> = {
  bumil: {
    title: "Monitoring Ibu Hamil",
    description:
      "Pantau riwayat ANC, tekanan darah, Hb, LILA, dan perubahan berat badan melalui grafik umum maupun grafik per individu.",
    metrics: [
      { key: "gestationalAge", label: "Usia kehamilan", unit: "minggu" },
      { key: "weight", label: "Berat badan", unit: "kg" },
      { key: "systolicBP", label: "Tekanan sistolik", unit: "mmHg" },
      { key: "diastolicBP", label: "Tekanan diastolik", unit: "mmHg" },
      { key: "hb", label: "Hemoglobin", unit: "g/dL" },
      { key: "lila", label: "LILA", unit: "cm" },
    ],
  },
  remaja: {
    title: "Monitoring Remaja",
    description:
      "Analisis antropometri dan skrining anemia remaja secara agregat, lalu telusuri perubahan setiap individu dari waktu ke waktu.",
    metrics: [
      { key: "weight", label: "Berat badan", unit: "kg" },
      { key: "height", label: "Tinggi badan", unit: "cm" },
      { key: "armCircumference", label: "Lingkar lengan", unit: "cm" },
      { key: "hb", label: "Hemoglobin", unit: "g/dL" },
    ],
  },
  produktif: {
    title: "Monitoring Usia Produktif",
    description:
      "Lihat tren faktor risiko penyakit tidak menular, mulai dari IMT dan lingkar pinggang hingga tekanan darah, gula darah, dan kolesterol.",
    metrics: [
      { key: "weight", label: "Berat badan", unit: "kg" },
      { key: "bmi", label: "IMT", unit: "kg/m²" },
      { key: "waistCircumference", label: "Lingkar pinggang", unit: "cm" },
      { key: "systolicBP", label: "Tekanan sistolik", unit: "mmHg" },
      { key: "diastolicBP", label: "Tekanan diastolik", unit: "mmHg" },
      { key: "bloodSugar", label: "Gula darah", unit: "mg/dL" },
      { key: "cholesterol", label: "Kolesterol", unit: "mg/dL" },
    ],
  },
  lansia: {
    title: "Monitoring Lansia",
    description:
      "Pantau tekanan darah, gula darah, kolesterol, asam urat, dan perubahan berat badan lansia dalam tampilan yang mudah dibandingkan.",
    metrics: [
      { key: "weight", label: "Berat badan", unit: "kg" },
      { key: "systolicBP", label: "Tekanan sistolik", unit: "mmHg" },
      { key: "diastolicBP", label: "Tekanan diastolik", unit: "mmHg" },
      { key: "bloodSugar", label: "Gula darah", unit: "mg/dL" },
      { key: "cholesterol", label: "Kolesterol", unit: "mg/dL" },
      { key: "uricAcid", label: "Asam urat", unit: "mg/dL" },
    ],
  },
};

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function loadBalita(): Promise<{ people: BalitaPerson[]; databaseAvailable: boolean }> {
  try {
    const visitors = await prisma.visitor.findMany({
      where: { isActive: true, category: { name: "Balita" } },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        gender: true,
        birthDate: true,
        monitoringBalita: {
          orderBy: { examinationDate: "asc" },
          select: {
            id: true,
            examinationDate: true,
            ageMonth: true,
            weight: true,
            height: true,
            headCircumference: true,
            nutritionalStatus: true,
            notes: true,
          },
        },
      },
    });

    return {
      databaseAvailable: true,
      people: visitors.map((visitor) => ({
        id: visitor.id,
        fullName: visitor.fullName,
        gender: visitor.gender,
        birthDate: visitor.birthDate.toISOString(),
        records: visitor.monitoringBalita.map((record) => ({
          id: record.id,
          examinationDate: record.examinationDate.toISOString(),
          ageMonth: record.ageMonth,
          weight: Number(record.weight),
          height: Number(record.height),
          headCircumference: numberOrNull(record.headCircumference),
          nutritionalStatus: record.nutritionalStatus,
          notes: record.notes,
        })),
      })),
    };
  } catch (error) {
    console.error("Balita monitoring data error:", error);
    return { people: [], databaseAvailable: false };
  }
}

async function loadGeneric(category: string): Promise<{ people: GenericPerson[]; databaseAvailable: boolean }> {
  try {
    if (category === "bumil") {
      const visitors = await prisma.visitor.findMany({
        where: { isActive: true, category: { name: "Ibu Hamil" } },
        orderBy: { fullName: "asc" },
        select: {
          id: true,
          fullName: true,
          gender: true,
          monitoringIbuHamil: {
            orderBy: { examinationDate: "asc" },
            select: {
              id: true,
              examinationDate: true,
              gestationalAge: true,
              weight: true,
              systolicBP: true,
              diastolicBP: true,
              hb: true,
              lila: true,
              notes: true,
            },
          },
        },
      });
      return {
        databaseAvailable: true,
        people: visitors.map((visitor) => ({
          id: visitor.id,
          fullName: visitor.fullName,
          gender: visitor.gender,
          records: visitor.monitoringIbuHamil.map((record) => ({
            id: record.id,
            date: record.examinationDate.toISOString(),
            metrics: {
              gestationalAge: numberOrNull(record.gestationalAge),
              weight: numberOrNull(record.weight),
              systolicBP: numberOrNull(record.systolicBP),
              diastolicBP: numberOrNull(record.diastolicBP),
              hb: numberOrNull(record.hb),
              lila: numberOrNull(record.lila),
            },
            notes: record.notes,
          })),
        })),
      };
    }

    if (category === "remaja") {
      const visitors = await prisma.visitor.findMany({
        where: { isActive: true, category: { name: "Remaja" } },
        orderBy: { fullName: "asc" },
        select: {
          id: true,
          fullName: true,
          gender: true,
          monitoringRemaja: {
            orderBy: { examinationDate: "asc" },
            select: {
              id: true,
              examinationDate: true,
              weight: true,
              height: true,
              armCircumference: true,
              hb: true,
              notes: true,
            },
          },
        },
      });
      return {
        databaseAvailable: true,
        people: visitors.map((visitor) => ({
          id: visitor.id,
          fullName: visitor.fullName,
          gender: visitor.gender,
          records: visitor.monitoringRemaja.map((record) => ({
            id: record.id,
            date: record.examinationDate.toISOString(),
            metrics: {
              weight: numberOrNull(record.weight),
              height: numberOrNull(record.height),
              armCircumference: numberOrNull(record.armCircumference),
              hb: numberOrNull(record.hb),
            },
            notes: record.notes,
          })),
        })),
      };
    }

    if (category === "produktif") {
      const visitors = await prisma.visitor.findMany({
        where: { isActive: true, category: { name: "Usia Produktif" } },
        orderBy: { fullName: "asc" },
        select: {
          id: true,
          fullName: true,
          gender: true,
          monitoringUsiaProduktif: {
            orderBy: { examinationDate: "asc" },
            select: {
              id: true,
              examinationDate: true,
              weight: true,
              bmi: true,
              waistCircumference: true,
              systolicBP: true,
              diastolicBP: true,
              bloodSugar: true,
              cholesterol: true,
              notes: true,
            },
          },
        },
      });
      return {
        databaseAvailable: true,
        people: visitors.map((visitor) => ({
          id: visitor.id,
          fullName: visitor.fullName,
          gender: visitor.gender,
          records: visitor.monitoringUsiaProduktif.map((record) => ({
            id: record.id,
            date: record.examinationDate.toISOString(),
            metrics: {
              weight: numberOrNull(record.weight),
              bmi: numberOrNull(record.bmi),
              waistCircumference: numberOrNull(record.waistCircumference),
              systolicBP: numberOrNull(record.systolicBP),
              diastolicBP: numberOrNull(record.diastolicBP),
              bloodSugar: numberOrNull(record.bloodSugar),
              cholesterol: numberOrNull(record.cholesterol),
            },
            notes: record.notes,
          })),
        })),
      };
    }

    const visitors = await prisma.visitor.findMany({
      where: { isActive: true, category: { name: "Lanjut Usia" } },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        gender: true,
        monitoringLansia: {
          orderBy: { examinationDate: "asc" },
          select: {
            id: true,
            examinationDate: true,
            weight: true,
            systolicBP: true,
            diastolicBP: true,
            bloodSugar: true,
            cholesterol: true,
            uricAcid: true,
            notes: true,
          },
        },
      },
    });
    return {
      databaseAvailable: true,
      people: visitors.map((visitor) => ({
        id: visitor.id,
        fullName: visitor.fullName,
        gender: visitor.gender,
        records: visitor.monitoringLansia.map((record) => ({
          id: record.id,
          date: record.examinationDate.toISOString(),
          metrics: {
            weight: numberOrNull(record.weight),
            systolicBP: numberOrNull(record.systolicBP),
            diastolicBP: numberOrNull(record.diastolicBP),
            bloodSugar: numberOrNull(record.bloodSugar),
            cholesterol: numberOrNull(record.cholesterol),
            uricAcid: numberOrNull(record.uricAcid),
          },
          notes: record.notes,
        })),
      })),
    };
  } catch (error) {
    console.error(`${category} monitoring data error:`, error);
    return { people: [], databaseAvailable: false };
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const [{ category }, query] = await Promise.all([params, searchParams]);
  const rawId = Array.isArray(query.id) ? query.id[0] : query.id;
  const parsedId = rawId ? Number.parseInt(rawId, 10) : Number.NaN;
  const initialPersonId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;

  if (category === "balita") {
    const data = await loadBalita();
    return <BalitaMonitoringDashboard {...data} initialPersonId={initialPersonId} />;
  }

  const module = modules[category];
  if (!module) notFound();
  const data = await loadGeneric(category);

  return (
    <GenericMonitoringDashboard
      title={module.title}
      description={module.description}
      metrics={module.metrics}
      category={category}
      initialPersonId={initialPersonId}
      {...data}
    />
  );
}
