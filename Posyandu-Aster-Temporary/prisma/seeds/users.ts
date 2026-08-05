import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { validateNewPassword } from "../../utils/password";
import { VISITOR_BUMIL_ID } from "./visitors";

export const ADMIN_ID = 1;
export const KADER_ID = 2;
export const USER_ID = KADER_ID;
export const MASYARAKAT_USER_ID = 3;

type SeedPasswordName =
  | "SEED_ADMIN_PASSWORD"
  | "SEED_USER_PASSWORD"
  | "SEED_MASYARAKAT_PASSWORD";

function getSeedPassword(name: SeedPasswordName): string {
  const password = process.env[name];
  if (!password) throw new Error(`${name} wajib diisi sebelum menjalankan seed.`);
  const validationError = validateNewPassword(password);
  if (validationError) throw new Error(`${name}: ${validationError}`);
  return password;
}

export async function seedUsers(prisma: PrismaClient) {
  const [adminPassword, kaderPassword, masyarakatPassword] = await Promise.all([
    bcrypt.hash(getSeedPassword("SEED_ADMIN_PASSWORD"), 12),
    bcrypt.hash(getSeedPassword("SEED_USER_PASSWORD"), 12),
    bcrypt.hash(getSeedPassword("SEED_MASYARAKAT_PASSWORD"), 12),
  ]);

  await prisma.user.upsert({
    where: { id: ADMIN_ID },
    update: { fullName: "Administrator", email: "admin@posyanduaster.id", role: Role.ADMIN, isActive: true },
    create: { id: ADMIN_ID, fullName: "Administrator", email: "admin@posyanduaster.id", password: adminPassword, role: Role.ADMIN, isActive: true, mustChangePassword: true },
  });

  await prisma.user.upsert({
    where: { id: KADER_ID },
    update: { fullName: "Kader Aster", email: "kader@posyanduaster.id", role: Role.KADER, isActive: true },
    create: { id: KADER_ID, fullName: "Kader Aster", email: "kader@posyanduaster.id", password: kaderPassword, role: Role.KADER, isActive: true, mustChangePassword: true },
  });

  await prisma.user.upsert({
    where: { id: MASYARAKAT_USER_ID },
    update: { fullName: "Ibu Siti Aminah", email: "siti@posyanduaster.id", role: Role.MASYARAKAT, visitorId: VISITOR_BUMIL_ID, isActive: true },
    create: { id: MASYARAKAT_USER_ID, fullName: "Ibu Siti Aminah", email: "siti@posyanduaster.id", password: masyarakatPassword, role: Role.MASYARAKAT, visitorId: VISITOR_BUMIL_ID, isActive: true, mustChangePassword: true },
  });

  console.log("✅ Users Seeded (Admin, Kader, Masyarakat)");
}
