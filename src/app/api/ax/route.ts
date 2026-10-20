import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateAxAnswers } from "@/lib/ax";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  const company = clean(body.company, 60);
  if (!company) return NextResponse.json({ error: "계열사를 골라 주세요." }, { status: 400 });
  const name = clean(body.name, 60);
  const answers = validateAxAnswers(body.answers);
  if (!answers) return NextResponse.json({ error: "모든 문항에 응답해야 합니다." }, { status: 400 });
  try {
    const row = await db().insertAx({ company, name: name || null, answers });
    return NextResponse.json({ id: row.id });
  } catch (e) {
    console.error("[ax submit]", e);
    return NextResponse.json({ error: "저장에 실패했습니다. 잠시 후 다시 시도하세요." }, { status: 500 });
  }
}
