import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple hash from request headers (server-side fingerprint)
function fingerprintFromRequest(req: Request): string {
  const ua = req.headers.get("user-agent") ?? "unknown";
  const raw = ua;

  let hash = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}

// GET — List active devices for a salon
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

    const devices = await prisma.salon_devices.findMany({
      where: { salonId },
      orderBy: { lastSeen: "desc" },
    });

    return NextResponse.json({ devices });
  } catch (error) {
    console.error("Devices GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST — Register/check device
export async function POST(req: Request) {
  try {
    const { salonId, deviceName } = await req.json();

    if (!salonId) {
      return NextResponse.json(
        { error: "salonId is required" },
        { status: 400 }
      );
    }

    const fingerprint = fingerprintFromRequest(req);

    // Upsert device (update lastSeen if exists)
    const device = await prisma.salon_devices.upsert({
      where: {
        uniq_salon_device: {
          salonId,
          deviceFingerprint: fingerprint,
        },
      },
      update: {
        lastSeen: new Date(),
        ...(deviceName ? { deviceName } : {}),
      },
      create: {
        salonId,
        deviceFingerprint: fingerprint,
        deviceName: deviceName ?? null,
      },
    });

    // Check device count against subscription seats
    const salon = await prisma.salons.findUnique({
      where: { id: salonId },
      select: { subscription_seats: true },
    });

    const maxDevices = salon?.subscription_seats ?? 5;
    const currentDevices = await prisma.salon_devices.count({
      where: { salonId },
    });

    if (currentDevices > maxDevices) {
      return NextResponse.json({
        success: false,
        device,
        overLimit: true,
        currentDevices,
        maxDevices,
      });
    }

    return NextResponse.json({
      success: true,
      device,
      currentDevices,
      maxDevices,
    });
  } catch (error) {
    console.error("Devices POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE — Remove a device
export async function DELETE(req: Request) {
  try {
    const { salonId, deviceId } = await req.json();

    if (!salonId || !deviceId) {
      return NextResponse.json(
        { error: "salonId and deviceId are required" },
        { status: 400 }
      );
    }

    await prisma.salon_devices.delete({
      where: {
        id: deviceId,
        salonId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Devices DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
