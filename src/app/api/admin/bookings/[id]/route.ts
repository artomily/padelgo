import { NextResponse } from "next/server";
import { confirmBooking, adminCancelBooking, getBookingById } from "@/lib/actions";

function verifyAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("admin_auth=true");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const booking = await getBookingById(id);
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
}