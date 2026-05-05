import { NextResponse } from "next/server";
import { updateCourt } from "@/lib/data";

function verifyAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("admin_auth=true");
}

export async function PATCH(request: Request, { params }: { params: Promise<{ courtId: string }> }) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { courtId } = await params;
    const body = await request.json();
    return NextResponse.json(updateCourt(courtId, { name: body.name, type: body.type, pricePerHour: body.pricePerHour, isActive: body.isActive }));
  } catch {
    return NextResponse.json({ error: "Failed to update court" }, { status: 500 });
  }
}