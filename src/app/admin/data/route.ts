import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { score } from "@/lib/score";
import { isAuthed } from "../auth";
import type { OverviewData, OverviewPoint } from "@/lib/overview-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 진행자 현황판의 분포 탭이 30초마다 부르는 데이터. 현황판 쿠키가 있어야 응답한다.
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db().listAllFull();
  const toPoint = (r: (typeof rows)[number]): OverviewPoint => {
    const s = score(r.answers);
    return { company: r.company, name: r.name, mo: s.mo, ca: s.ca, quadrant: s.quadrant, created_at: r.created_at };
  };
  // 담당자는 계열사당 최신 1건만 (교차 보기와 같은 규칙). 팀장은 전부.
  const seen = new Set<string>();
  const staff: OverviewPoint[] = [];
  for (const r of rows) {
    if (r.role !== "staff" || seen.has(r.company)) continue;
    seen.add(r.company);
    staff.push(toPoint(r));
  }
  const leaders = rows.filter((r) => r.role === "leader").map(toPoint);
  const body: OverviewData = { staff, leaders, updatedAt: new Date().toISOString() };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
