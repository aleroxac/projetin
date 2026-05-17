import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const backendStatus = await checkBackend();
  const ready = backendStatus.status === "UP";

  return NextResponse.json(
    {
      status: ready ? "READY" : "NOT_READY",
      components: { backend: backendStatus },
    },
    { status: ready ? 200 : 503 }
  );
}

async function checkBackend(): Promise<{ status: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health/liveness`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) return { status: "UP" };
    return { status: "DOWN", message: `backend returned ${res.status}` };
  } catch (err) {
    return { status: "DOWN", message: String(err) };
  }
}
