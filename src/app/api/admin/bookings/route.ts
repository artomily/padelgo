import { NextResponse } from "next/server";
import { getAllBookings } from "@/lib/data";

function verifyAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("admin_auth=true");
}

export async function GET(request: Request) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const filters = { status: searchParams.get("status") || undefined, date: searchParams.get("date") || undefined };
    return NextResponse.json(getAllBookings(filters));
  } catch {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}