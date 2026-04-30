import { NextResponse } from "next/server";
import { confirmBooking } from "@/lib/actions";

function verifyAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("admin_auth=true");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const booking = await confirmBooking(id, body.paymentReference);
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: "Failed to confirm booking" }, { status: 500 });
  }
}