-- 조직개발 준비도 진단 응답 테이블.
-- Supabase 대시보드의 SQL Editor에 붙여 넣어 한 번 실행한다.

create table if not exists public.responses (
  id          uuid primary key default gen_random_uuid(),
  token       text not null unique,
  role        text not null check (role in ('staff', 'leader')),
  company     text not null,
  name        text,
  answers     jsonb not null,
  created_at  timestamptz not null default now()
);

create index if not exists responses_company_role_idx on public.responses (company, role, created_at desc);

-- 서버는 service role 키로만 접근한다. anon 키로는 아무것도 읽거나 쓸 수 없게 RLS를 켜고 정책을 두지 않는다.
alter table public.responses enable row level security;
