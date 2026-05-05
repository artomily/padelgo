import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json(getSettings());
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}