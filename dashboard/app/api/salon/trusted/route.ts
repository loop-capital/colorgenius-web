import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — List trusted stylists
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get("salonId");

    if (!salonId) {
      return NextResponse.json(
        { error: "salonId is required" },
        { status: 400 }
      );
    }

    const salon = await prisma.salons.findUnique({
      where: { id: salonId },
      select: { trusted_stylists: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json({ trusted_stylists: salon.trusted_stylists });
  } catch (error) {
    console.error("Trusted stylists GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST — Add trusted stylist
export async function POST(req: Request) {
  try {
    const { salonId, stylistId } = await req.json();

    if (!salonId || !stylistId) {
      return NextResponse.json(
        { error: "salonId and stylistId are required" },
        { status: 400 }
      );
    }

    const salon = await prisma.salons.findUnique({
      where: { id: salonId },
      select: { trusted_stylists: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    if (salon.trusted_stylists.includes(stylistId)) {
      return NextResponse.json({
        success: true,
        message: "Stylist is already trusted",
        trusted_stylists: salon.trusted_stylists,
      });
    }

    const updated = await prisma.salons.update({
      where: { id: salonId },
      data: {
        trusted_stylists: {
          push: stylistId,
        },
      },
      select: { trusted_stylists: true },
    });

    return NextResponse.json({
      success: true,
      trusted_stylists: updated.trusted_stylists,
    });
  } catch (error) {
    console.error("Trusted stylists POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE — Remove trusted stylist
export async function DELETE(req: Request) {
  try {
    const { salonId, stylistId } = await req.json();

    if (!salonId || !stylistId) {
      return NextResponse.json(
        { error: "salonId and stylistId are required" },
        { status: 400 }
      );
    }

    const salon = await prisma.salons.findUnique({
      where: { id: salonId },
      select: { trusted_stylists: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const updated = await prisma.salons.update({
      where: { id: salonId },
      data: {
        trusted_stylists: {
          set: salon.trusted_stylists.filter((id) => id !== stylistId),
        },
      },
      select: { trusted_stylists: true },
    });

    return NextResponse.json({
      success: true,
      trusted_stylists: updated.trusted_stylists,
    });
  } catch (error) {
    console.error("Trusted stylists DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
