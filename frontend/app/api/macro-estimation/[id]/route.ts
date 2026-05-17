import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${API_BASE_URL}/macro-estimation/${id}`, {
      method: "DELETE",
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
