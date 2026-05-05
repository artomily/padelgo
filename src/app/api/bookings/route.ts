import { NextResponse } from "next/server";
import { createBooking } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const booking = createBooking(body);
    return NextResponse.json(booking, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}