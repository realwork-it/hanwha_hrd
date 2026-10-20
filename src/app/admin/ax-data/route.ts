import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AX_ITEMS } from "@/lib/ax";
import { isAuthed } from "../auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface AxCounts {
  total: number;
  companies: number;
  items: { id: string; counts: number[] }[];
  updatedAt: string;
}

// 대시보드 AX 탭이 30초마다 부르는 집계. 개인 응답은 내보내지 않고 보기별 수만 준다.
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db().listAx();
  const items = AX_ITEMS.map((it) => {
    const counts = new Array<number>(it.o.length).fill(0);
    rows.forEach((r) => {
      const v = r.answers[it.id];
      const picks = Array.isArray(v) ? v : typeof v === "number" ? [v] : [];
      picks.forEach((n) => {
        if (n >= 0 && n < counts.length) counts[n] += 1;
      });
    });
    return { id: it.id, counts };
  });
  const body: AxCounts = {
    total: rows.length,
    companies: new Set(rows.map((r) => r.company)).size,
    items,
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
