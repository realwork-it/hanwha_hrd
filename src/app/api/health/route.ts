import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 배포 점검용. 비밀값은 내보내지 않고 설정 여부, 값의 형식, DB 연결 결과만 알려 준다.
export async function GET() {
  const url = process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const shape = (v: string) => ({
    set: v.length > 0,
    length: v.length,
    hasWhitespace: /\s/.test(v),
    hasQuotes: /["']/.test(v),
    startsWith: v.slice(0, 4),
  });
  const out: Record<string, unknown> = {
    url: { ...shape(url), endsWithRest: /\/rest\/v1\/?$/.test(url), host: safeHost(url) },
    key: {
      ...shape(key),
      type: key.startsWith("sb_secret_")
        ? "secret"
        : key.startsWith("sb_publishable_")
          ? "publishable (잘못된 키, secret 또는 service_role 필요)"
          : key.startsWith("eyJ")
            ? "legacy jwt"
            : "unknown",
    },
    adminPassword: !!process.env.ADMIN_PASSWORD,
  };

  if (url && key) {
    // 1) 원시 REST 요청. 상태 코드와 본문 앞부분만 본다.
    try {
      const base = url.replace(/\/+$/, "");
      const res = await fetch(`${base}/rest/v1/responses?select=id&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: "no-store",
      });
      const text = await res.text();
      out.raw = { status: res.status, body: text.slice(0, 200) };
    } catch (e) {
      out.raw = { error: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
    }
    // 2) supabase-js 경로
    try {
      const client = createClient(url, key, { auth: { persistSession: false } });
      const { count, error } = await client.from("responses").select("id", { count: "exact", head: true });
      out.db = error
        ? { ok: false, code: error.code, message: error.message, details: error.details, hint: error.hint }
        : { ok: true, rows: count };
    } catch (e) {
      out.db = { ok: false, error: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
    }
  } else {
    out.db = { ok: false, message: "환경 변수가 없습니다." };
  }
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}

function safeHost(u: string): string | null {
  try {
    return new URL(u).host;
  } catch {
    return null;
  }
}
