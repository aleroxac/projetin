import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    const res = await fetch(`${API_BASE_URL}/macro-estimation?user_id=${userId}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Backend error", status: res.status, body: text },
        { status: res.status }
      );
    }

    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json({ error: "Failed to reach backend", detail: String(err) }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(`${API_BASE_URL}/macro-estimation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Backend error", status: res.status, body: text },
        { status: res.status }
      );
    }

    return NextResponse.json(await res.json(), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to reach backend", detail: String(err) }, { status: 502 });
  }
}
