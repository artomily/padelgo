import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const courtId = searchParams.get("courtId");
    if (!date) return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    return NextResponse.json(getAvailableSlots(date, courtId || undefined));
  } catch {
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}