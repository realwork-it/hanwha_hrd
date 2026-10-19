import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateAnswers } from "@/lib/score";

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

  const role = body.role === "leader" ? "leader" : body.role === "staff" ? "staff" : null;
  if (!role) return NextResponse.json({ error: "역할이 올바르지 않습니다." }, { status: 400 });

  const company = clean(body.company, 60);
  if (!company) return NextResponse.json({ error: "계열사를 골라 주세요." }, { status: 400 });

  const name = clean(body.name, 60);
  if (role === "leader" && !name) {
    return NextResponse.json({ error: "이름이나 소속을 적어 주세요." }, { status: 400 });
  }

  const answers = validateAnswers(body.answers);
  if (!answers) return NextResponse.json({ error: "15문항에 모두 응답해야 합니다." }, { status: 400 });

  try {
    const row = await db().insert({ role, company, name: name || null, answers });
    return NextResponse.json({ token: row.token });
  } catch (e) {
    console.error("[submit]", e);
    return NextResponse.json({ error: "저장에 실패했습니다. 잠시 후 다시 시도하세요." }, { status: 500 });
  }
}
