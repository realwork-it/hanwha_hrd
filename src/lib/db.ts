import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Answers } from "./score";

export type Role = "staff" | "leader";

export interface ResponseRow {
  id: string;
  token: string;
  role: Role;
  company: string;
  name: string | null;
  answers: Answers;
  created_at: string;
}

export type ResponseSummary = Omit<ResponseRow, "answers">;
export type NewResponse = Omit<ResponseRow, "id" | "token" | "created_at">;

/** 추측할 수 없는 결과지 토큰. 96비트 난수를 base64url로 적는다. */
export const makeToken = (): string => randomBytes(12).toString("base64url");

interface Store {
  insert(row: NewResponse): Promise<ResponseRow>;
  getByToken(token: string): Promise<ResponseRow | null>;
  getById(id: string): Promise<ResponseRow | null>;
  listStaffByCompany(company: string): Promise<ResponseRow[]>;
  listAll(): Promise<ResponseSummary[]>;
  /** 분포 화면용. 원점수까지 포함한 전체 응답 */
  listAllFull(): Promise<ResponseRow[]>;
}

// ---------- Supabase (운영) ----------
function supabaseStore(client: SupabaseClient): Store {
  const T = "responses";
  const cols = "id, token, role, company, name, answers, created_at";
  return {
    async insert(row) {
      // 토큰 충돌은 사실상 없지만 unique 제약에 걸리면 한 번 더 시도한다.
      for (let attempt = 0; attempt < 3; attempt++) {
        const token = makeToken();
        const { data, error } = await client.from(T).insert({ ...row, token }).select(cols).single();
        if (!error) return data as ResponseRow;
        if (error.code !== "23505") throw new Error(`insert failed: ${error.message}`);
      }
      throw new Error("insert failed: token collision");
    },
    async getByToken(token) {
      const { data, error } = await client.from(T).select(cols).eq("token", token).maybeSingle();
      if (error) throw new Error(`getByToken failed: ${error.message}`);
      return (data as ResponseRow | null) ?? null;
    },
    async getById(id) {
      const { data, error } = await client.from(T).select(cols).eq("id", id).maybeSingle();
      if (error) throw new Error(`getById failed: ${error.message}`);
      return (data as ResponseRow | null) ?? null;
    },
    async listStaffByCompany(company) {
      const { data, error } = await client
        .from(T)
        .select(cols)
        .eq("role", "staff")
        .eq("company", company)
        .order("created_at", { ascending: false });
      if (error) throw new Error(`listStaffByCompany failed: ${error.message}`);
      return (data as ResponseRow[]) ?? [];
    },
    async listAll() {
      const { data, error } = await client
        .from(T)
        .select("id, token, role, company, name, created_at")
        .order("created_at", { ascending: false });
      if (error) throw new Error(`listAll failed: ${error.message}`);
      return (data as ResponseSummary[]) ?? [];
    },
    async listAllFull() {
      const { data, error } = await client.from(T).select(cols).order("created_at", { ascending: false });
      if (error) throw new Error(`listAllFull failed: ${error.message}`);
      return (data as ResponseRow[]) ?? [];
    },
  };
}

// ---------- 로컬 파일 (개발용. SUPABASE_URL이 없을 때만) ----------
function fileStore(): Store {
  const file = path.join(process.cwd(), ".data", "responses.json");
  let chain: Promise<unknown> = Promise.resolve();
  const read = async (): Promise<ResponseRow[]> => {
    try {
      return JSON.parse(await fs.readFile(file, "utf8")) as ResponseRow[];
    } catch {
      return [];
    }
  };
  const write = async (rows: ResponseRow[]) => {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(rows, null, 2), "utf8");
  };
  // 쓰기는 직렬화해서 동시 제출이 서로 덮어쓰지 않게 한다.
  const serial = <T,>(fn: () => Promise<T>): Promise<T> => {
    const next = chain.then(fn, fn);
    chain = next.catch(() => undefined);
    return next;
  };
  return {
    insert: (row) =>
      serial(async () => {
        const rows = await read();
        const full: ResponseRow = {
          ...row,
          id: randomBytes(16).toString("hex"),
          token: makeToken(),
          created_at: new Date().toISOString(),
        };
        rows.push(full);
        await write(rows);
        return full;
      }),
    getByToken: async (token) => (await read()).find((r) => r.token === token) ?? null,
    getById: async (id) => (await read()).find((r) => r.id === id) ?? null,
    listStaffByCompany: async (company) =>
      (await read())
        .filter((r) => r.role === "staff" && r.company === company)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    listAll: async () =>
      (await read())
        .map((r) => {
          const { answers: _answers, ...rest } = r;
          void _answers;
          return rest;
        })
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    listAllFull: async () => (await read()).sort((a, b) => b.created_at.localeCompare(a.created_at)),
  };
}

let store: Store | null = null;

export function db(): Store {
  if (store) return store;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    store = supabaseStore(createClient(url, key, { auth: { persistSession: false } }));
  } else {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");
    }
    console.warn("[db] SUPABASE_URL이 없어 .data/responses.json 파일 저장소를 씁니다 (개발 전용).");
    store = fileStore();
  }
  return store;
}
