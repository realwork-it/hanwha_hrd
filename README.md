# 조직변화 준비도 체크 웹앱

한화인재경영원 워크숍(2026.10.20 ~ 22)에서 쓰는 조직변화 준비도 체크 웹앱. 리얼워크 프로토타입 v0.9(Version 11)의 문항, 문구, 산출 로직을 그대로 옮겼다.

## 경로

| 경로 | 용도 |
| --- | --- |
| `/` | 1차. 조직문화 담당자용 진단지 (Day 1) |
| `/leader` | 2차. 팀장용 진단지. 제출하면 같은 계열사 담당자 결과와 교차 보기 (Day 3) |
| `/r/{토큰}` | 개인 결과지. 토큰을 아는 사람만 볼 수 있다 |
| `/admin` | 진행자용 응답 현황. 비밀번호 보호, 점수는 표시하지 않는다 |

## 로컬 실행

```bash
npm install
npm run dev
```

`.env.local`에 `ADMIN_PASSWORD`만 있으면 된다. `SUPABASE_URL`이 없으면 `.data/responses.json` 파일에 저장한다(개발 전용).

## 배포 (Vercel + Supabase)

1. Supabase 프로젝트를 만들고 SQL Editor에서 `supabase/schema.sql`을 실행한다.
2. Supabase 설정 > API 에서 Project URL과 service_role 키를 복사한다.
3. Vercel에서 이 저장소를 import 하고 환경 변수 세 개를 넣는다.
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
4. 배포 URL이 나오면 `/`와 `/leader` 두 주소로 QR을 만든다.

## 고칠 때 보는 곳

- 문항, 선택지, 기준선, 사분면과 제언 문구: `src/lib/config.ts` (리얼워크 확인 없이 바꾸지 않는다)
- 산출 로직: `src/lib/score.ts`
- 계열사 드롭다운 목록: `src/lib/companies.ts`
- 결과지 7개 블록: `src/components/ResultSheet.tsx`
- 교차 보기: `src/components/CrossView.tsx`
- 저장소 (Supabase 또는 로컬 파일): `src/lib/db.ts`

## 데이터

응답은 원점수(`answers`)만 저장하고 동력, 역량, 사분면, 변화 유형, 제언은 화면에서 다시 계산한다. 보존 기간은 워크숍 후 한화와 협의해 정하고, 기본값은 종료 1개월 후 삭제다.
