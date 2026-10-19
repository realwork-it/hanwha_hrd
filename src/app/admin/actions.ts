"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, passwordMatches, sessionValue } from "./auth";

export async function login(formData: FormData) {
  const input = String(formData.get("password") ?? "");
  if (!passwordMatches(input)) redirect("/admin?error=1");
  (await cookies()).set(COOKIE, sessionValue()!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
  redirect("/admin");
}
