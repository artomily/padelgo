import { NextResponse } from "next/server";
import { updateSetting, getSettings } from "@/lib/actions";

function verifyAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("admin_auth=true");
}

export async function PUT(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await request.json();
    const results = [];

    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === "string") {
        const result = await updateSetting(key, value);
        results.push(result);
      }
    }

    const updatedSettings = await getSettings();
    return NextResponse.json(updatedSettings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}