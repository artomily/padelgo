import { NextResponse } from "next/server";
import { getAllCourts, getActiveCourts } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");
    if (all === "true") return NextResponse.json(getAllCourts());
    return NextResponse.json(getActiveCourts());
  } catch {
    return NextResponse.json({ error: "Failed to fetch courts" }, { status: 500 });
  }
}