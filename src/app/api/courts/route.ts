import { NextResponse } from "next/server";
import { getActiveCourts } from "@/lib/actions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");
    
    if (all === "true") {
      const { createServerClient } = await import("@/lib/supabase");
      const serverClient = createServerClient();
      const { data, error } = await serverClient.from("courts").select("*").order("name");
      if (error) throw error;
      return NextResponse.json(data);
    }
    
    const courts = await getActiveCourts();
    return NextResponse.json(courts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courts" }, { status: 500 });
  }
}