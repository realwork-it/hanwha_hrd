-- AX 퀵 서베이 응답 테이블. 준비도 체크와 별개로 둔다.
-- Supabase 대시보드의 SQL Editor에 붙여 넣어 한 번 실행한다.

create table if not exists public.ax_responses (
  id          uuid primary key default gen_random_uuid(),
  company     text not null,
  name        text,
  answers     jsonb not null,
  created_at  timestamptz not null default now(),
  role        text
);

-- 2026-10-21 추가: 담당자/팀장 구분. 이미 만든 테이블에는 아래를 실행한다.
-- alter table public.ax_responses add column if not exists role text;
-- update public.ax_responses set role = 'staff' where role is null;

create index if not exists ax_responses_created_idx on public.ax_responses (created_at desc);

-- 서버는 service role 키로만 접근한다. anon 키로는 아무것도 읽거나 쓸 수 없게 RLS를 켜고 정책을 두지 않는다.
alter table public.ax_responses enable row level security;
