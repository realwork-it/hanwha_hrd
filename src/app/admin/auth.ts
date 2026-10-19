import "server-only";
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

export const COOKIE = "odr_admin";

/** 쿠키에 넣는 세션 값. 비밀번호 자체가 아니라 해시를 넣는다. */
export function sessionValue(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(`odr:${pw}`).digest("hex");
}

export function passwordMatches(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || input.length !== pw.length) return false;
  return timingSafeEqual(Buffer.from(input), Buffer.from(pw));
}

export async function isAuthed(): Promise<boolean> {
  const expected = sessionValue();
  if (!expected) return false;
  const got = (await cookies()).get(COOKIE)?.value ?? "";
  if (got.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}
