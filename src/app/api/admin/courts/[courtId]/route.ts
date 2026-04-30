import { NextResponse } from "next/server";
import { updateCourt } from "@/lib/actions";

function verifyAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("admin_auth=true");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courtId: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courtId } = await params;
    const body = await request.json();
    const court = await updateCourt(courtId, {
      name: body.name,
      description: body.description,
      price_per_hour: body.price_per_hour,
      is_active: body.is_active,
    });
    return NextResponse.json(court);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update court" }, { status: 500 });
  }
}