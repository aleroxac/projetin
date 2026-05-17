import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dietPlanId = searchParams.get("diet_plan_id");
    const userId = searchParams.get("user_id");
    if (!dietPlanId || !userId) {
      return NextResponse.json({ error: "diet_plan_id and user_id are required" }, { status: 400 });
    }
    const res = await fetch(
      `${API_BASE_URL}/diet-plan/adherence?diet_plan_id=${dietPlanId}&user_id=${userId}`,
      { headers: { Accept: "application/json" }, cache: "no-store" }
    );
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Backend error", body: text }, { status: res.status });
    }
    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json({ error: "Failed to reach backend", detail: String(err) }, { status: 502 });
  }
}
