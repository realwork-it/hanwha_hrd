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
  /** 주관식 응답. 누가 썼는지 짐작할 수 없도록 순서를 섞어 보낸다 */
  texts: { id: string; answers: string[] }[];
  updatedAt: string;
}

// 대시보드 AX 탭이 30초마다 부르는 집계. 개인 응답은 내보내지 않고 보기별 수만 준다.
export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // role=leader면 팀장 응답만, 그 밖에는 담당자 응답만(역할이 비어 있는 옛 행 포함).
  const role = new URL(req.url).searchParams.get("role") === "leader" ? "leader" : "staff";
  const rows = (await db().listAx()).filter((r) => (role === "leader" ? r.role === "leader" : r.role !== "leader"));
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const texts = AX_ITEMS.filter((it) => it.kind === "text").map((it) => ({
    id: it.id,
    answers: shuffle(rows.map((r) => r.answers[it.id]).filter((v): v is string => typeof v === "string" && v.trim().length > 0)),
  }));
  const items = AX_ITEMS.filter((it) => it.kind !== "text").map((it) => {
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
    texts,
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
