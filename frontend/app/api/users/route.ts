import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic"; // sempre busca fresco

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/user`, {
      method: "GET",
      headers: { Accept: "application/json" },
      // Do lado do servidor não há CORS; apenas repassamos.
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Backend respondeu erro", status: res.status, body: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro ao chamar backend /user:", err);
    return NextResponse.json(
      { error: "Falha ao contatar backend", detail: String(err) },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const res = await fetch(`${API_BASE_URL}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Backend respondeu erro", status: res.status, body: text },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar backend /user:", err);
    return NextResponse.json(
      { error: "Falha ao contatar backend", detail: String(err) },
      { status: 502 }
    );
  }
}
