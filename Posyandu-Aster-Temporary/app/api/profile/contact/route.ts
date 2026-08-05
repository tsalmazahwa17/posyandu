import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst({
      select: {
        organizationName: true,
        phone: true,
        email: true,
        address: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          organizationName: "Posyandu Aster",
          phone: null,
          email: null,
          address: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error("Get profile contact error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data kontak." },
      { status: 500 }
    );
  }
}
