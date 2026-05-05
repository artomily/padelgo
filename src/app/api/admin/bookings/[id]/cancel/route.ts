import { NextResponse } from "next/server";
import { adminCancelBooking } from "@/lib/data";

function verifyAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("admin_auth=true");
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    return NextResponse.json(adminCancelBooking(id));
  } catch {
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}