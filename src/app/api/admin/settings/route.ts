import { NextResponse } from "next/server";
import { updateSettings } from "@/lib/data";

function verifyAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("admin_auth=true");
}

export async function PUT(request: Request) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const newSettings = await request.json();
    return NextResponse.json(updateSettings(newSettings));
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}