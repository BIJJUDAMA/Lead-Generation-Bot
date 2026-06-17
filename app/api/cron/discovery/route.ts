import { NextRequest, NextResponse } from "next/server";
import { discoveryService } from "@/lib/discovery/service";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  // Security check for Vercel Cron
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await discoveryService.runDiscovery();
    return NextResponse.json({ success: true, message: "Discovery run completed" });
  } catch (error) {
    console.error("Discovery run failed:", error);
    return NextResponse.json({ success: false, error: "Discovery run failed" }, { status: 500 });
  }
}
