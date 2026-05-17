import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const res = await fetch(`${API_BASE_URL}/user/${id}`, {
      method: "GET",
      headers: { Accept: "application/json" },
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
    console.error("Erro ao buscar backend /user/:id", err);
    return NextResponse.json(
      { error: "Falha ao contatar backend", detail: String(err) },
      { status: 502 }
    );
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const payload = await request.json();
    const res = await fetch(`${API_BASE_URL}/user/${id}`, {
      method: "PUT",
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
    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro ao atualizar backend /user/:id", err);
    return NextResponse.json(
      { error: "Falha ao contatar backend", detail: String(err) },
      { status: 502 }
    );
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const res = await fetch(`${API_BASE_URL}/user/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Backend respondeu erro", status: res.status, body: text },
        { status: res.status }
      );
    }
    // 204 cannot include a body
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Erro ao excluir backend /user/:id", err);
    return NextResponse.json(
      { error: "Falha ao contatar backend", detail: String(err) },
      { status: 502 }
    );
  }
}
