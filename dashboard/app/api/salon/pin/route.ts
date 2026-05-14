import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// POST — Set/Update PIN
export async function POST(req: Request) {
  try {
    const { salonId, pin, currentPin } = await req.json();

    if (!salonId || !pin) {
      return NextResponse.json(
        { error: "salonId and pin are required" },
        { status: 400 }
      );
    }

    if (typeof pin !== "string" || pin.length < 4) {
      return NextResponse.json(
        { error: "PIN must be at least 4 characters" },
        { status: 400 }
      );
    }

    const salon = await prisma.salons.findUnique({
      where: { id: salonId },
      select: { salon_pin: true, salon_pin_set: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // If PIN is already set, verify currentPin before allowing update
    if (salon.salon_pin_set && salon.salon_pin) {
      if (!currentPin) {
        return NextResponse.json(
          { error: "currentPin is required to update existing PIN" },
          { status: 403 }
        );
      }
      const isValid = await bcrypt.compare(currentPin, salon.salon_pin);
      if (!isValid) {
        return NextResponse.json(
          { error: "Current PIN is incorrect" },
          { status: 403 }
        );
      }
    }

    const hashedPin = await bcrypt.hash(pin, SALT_ROUNDS);

    await prisma.salons.update({
      where: { id: salonId },
      data: {
        salon_pin: hashedPin,
        salon_pin_set: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PIN set error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT — Verify PIN
export async function PUT(req: Request) {
  try {
    const { salonId, pin } = await req.json();

    if (!salonId || !pin) {
      return NextResponse.json(
        { error: "salonId and pin are required" },
        { status: 400 }
      );
    }

    const salon = await prisma.salons.findUnique({
      where: { id: salonId },
      select: { salon_pin: true, salon_pin_set: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    if (!salon.salon_pin_set || !salon.salon_pin) {
      return NextResponse.json(
        { error: "No PIN has been set for this salon" },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(pin, salon.salon_pin);

    return NextResponse.json({ valid });
  } catch (error) {
    console.error("PIN verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
