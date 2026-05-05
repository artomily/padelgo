import { NextResponse } from "next/server";
import { createCourt } from "@/lib/data";

function verifyAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("admin_auth=true");
}

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    return NextResponse.json(createCourt({ name: body.name, type: body.type || "indoor", pricePerHour: body.pricePerHour }), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create court" }, { status: 500 });
  }
}