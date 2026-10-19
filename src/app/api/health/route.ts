import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 배포 점검용. 비밀값은 내보내지 않고 설정 여부와 DB 연결 결과만 알려 준다.
export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const out: Record<string, unknown> = {
    env: {
      SUPABASE_URL: !!url,
      SUPABASE_SERVICE_ROLE_KEY: !!key,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    },
    keyType: !key ? null : key.startsWith("sb_secret_") ? "secret" : key.startsWith("sb_publishable_") ? "publishable (잘못된 키)" : key.startsWith("eyJ") ? "legacy jwt" : "unknown",
  };
  if (url && key) {
    try {
      const client = createClient(url, key, { auth: { persistSession: false } });
      const { count, error } = await client.from("responses").select("id", { count: "exact", head: true });
      out.db = error ? { ok: false, code: error.code, message: error.message } : { ok: true, rows: count };
    } catch (e) {
      out.db = { ok: false, message: e instanceof Error ? e.message : String(e) };
    }
  } else {
    out.db = { ok: false, message: "환경 변수가 없습니다." };
  }
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}
