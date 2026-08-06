export interface MonitoringBalitaDTO {
  id: number;
  visitorId: number;
  recordedBy: number;
  examinationDate: Date | string;
  monthNumber: number;
  ageMonth: number;
  weight: number;
  height: number;
  headCircumference?: number | null;
  nutritionalStatus?: string | null;
  immunization?: string | null;
  vitamin?: string | null;
  kpspResult?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  visitor?: {
    id: number;
    fullName: string;
    nik?: string | null;
    birthDate?: Date | string;
  };
  recorder?: {
    id: number;
    fullName: string;
  };
}

export interface CreateBalitaInput {
  visitorId: number;
  examinationDate: Date | string;
  monthNumber: number;
  ageMonth: number;
  weight: number;
  height: number;
  headCircumference?: number | null;
  nutritionalStatus?: string | null;
  immunization?: string | null;
  vitamin?: string | null;
  kpspResult?: string | null;
  notes?: string | null;
}

export interface MonitoringIbuHamilDTO {
  id: number;
  visitorId: number;
  recordedBy: number;
  examinationDate: Date | string;
  gestationalAge?: number | null;
  weight?: number | null;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  hb?: number | null;
  lila?: number | null;
  hpht?: Date | string | null;
  hpl?: Date | string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  visitor?: {
    id: number;
    fullName: string;
    nik?: string | null;
    birthDate?: Date | string;
  };
  recorder?: {
    id: number;
    fullName: string;
  };
}

export interface CreateIbuHamilInput {
  visitorId: number;
  examinationDate: Date | string;
  gestationalAge?: number | null;
  weight?: number | null;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  hb?: number | null;
  lila?: number | null;
  hpht?: Date | string | null;
  hpl?: Date | string | null;
  notes?: string | null;
}

export interface MonitoringRemajaDTO {
  id: number;
  visitorId: number;
  recordedBy: number;
  examinationDate: Date | string;
  weight?: number | null;
  height?: number | null;
  armCircumference?: number | null;
  hb?: number | null;
  anemiaStatus?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  visitor?: {
    id: number;
    fullName: string;
    nik?: string | null;
  };
  recorder?: {
    id: number;
    fullName: string;
  };
}

export interface CreateRemajaInput {
  visitorId: number;
  examinationDate: Date | string;
  weight?: number | null;
  height?: number | null;
  armCircumference?: number | null;
  hb?: number | null;
  anemiaStatus?: string | null;
  notes?: string | null;
}

export interface MonitoringUsiaProduktifDTO {
  id: number;
  visitorId: number;
  recordedBy: number;
  examinationDate: Date | string;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  waistCircumference?: number | null;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  bloodSugar?: number | null;
  cholesterol?: number | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  visitor?: {
    id: number;
    fullName: string;
    nik?: string | null;
  };
  recorder?: {
    id: number;
    fullName: string;
  };
}

export interface CreateUsiaProduktifInput {
  visitorId: number;
  examinationDate: Date | string;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  waistCircumference?: number | null;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  bloodSugar?: number | null;
  cholesterol?: number | null;
  notes?: string | null;
}

export interface MonitoringLansiaDTO {
  id: number;
  visitorId: number;
  recordedBy: number;
  examinationDate: Date | string;
  weight?: number | null;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  bloodSugar?: number | null;
  cholesterol?: number | null;
  uricAcid?: number | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  visitor?: {
    id: number;
    fullName: string;
    nik?: string | null;
  };
  recorder?: {
    id: number;
    fullName: string;
  };
}

export interface CreateLansiaInput {
  visitorId: number;
  examinationDate: Date | string;
  weight?: number | null;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  bloodSugar?: number | null;
  cholesterol?: number | null;
  uricAcid?: number | null;
  notes?: string | null;
}

export type UpdateBalitaInput = Partial<CreateBalitaInput>;
export type UpdateIbuHamilInput = Partial<CreateIbuHamilInput>;
export type UpdateRemajaInput = Partial<CreateRemajaInput>;
export type UpdateUsiaProduktifInput = Partial<CreateUsiaProduktifInput>;
export type UpdateLansiaInput = Partial<CreateLansiaInput>;

