import { NextResponse } from "next/server";
import { createCourt } from "@/lib/actions";

function verifyAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("admin_auth=true");
}

export async function POST(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const court = await createCourt({
      name: body.name,
      description: body.description,
      price_per_hour: body.price_per_hour,
    });
    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create court" }, { status: 500 });
  }
}