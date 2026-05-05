import { NextResponse } from "next/server";
import { cancelBooking } from "@/lib/data";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const booking = cancelBooking(id);
    return NextResponse.json(booking);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to cancel booking";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}