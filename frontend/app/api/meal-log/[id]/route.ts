import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API_BASE_URL}/meal-log/${id}`, { cache: "no-store" });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API_BASE_URL}/meal-log/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API_BASE_URL}/meal-log/${id}`, { method: "DELETE" });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });
  return new NextResponse(null, { status: 204 });
}
