import type { Metadata } from "next";
import { db, type ResponseSummary } from "@/lib/db";
import { COMPANIES } from "@/lib/companies";
import { isAuthed } from "./auth";
import { login, logout } from "./actions";
import Overview from "@/components/Overview";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "응답 현황 | 조직변화 준비도 체크",
  robots: { index: false, follow: false },
};

const fmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const { error, tab } = await searchParams;
  const activeTab = tab === "overview" ? "overview" : "status";
  const authed = await isAuthed();

  if (!authed) {
    return (
      <Shell>
        <div className="start" style={{ maxWidth: 420 }}>
          <form action={login}>
            <div className="field">
              <label htmlFor="password">진행자 비밀번호</label>
              <input type="password" id="password" name="password" required autoFocus />
              {error && <span className="hint" style={{ color: "var(--red)" }}>비밀번호가 맞지 않습니다.</span>}
              {!process.env.ADMIN_PASSWORD && (
                <span className="hint" style={{ color: "var(--red)" }}>
                  ADMIN_PASSWORD 환경 변수가 설정되지 않아 로그인할 수 없습니다.
                </span>
              )}
            </div>
            <button type="submit" className="btn">
              현황 보기
            </button>
          </form>
        </div>
      </Shell>
    );
  }

  const rows = await db().listAll();
  const staff = rows.filter((r) => r.role === "staff");
  const leaders = rows.filter((r) => r.role === "leader");
  const byCompany = new Map<string, { staff: ResponseSummary[]; leaders: ResponseSummary[] }>();
  const ensure = (c: string) => {
    if (!byCompany.has(c)) byCompany.set(c, { staff: [], leaders: [] });
    return byCompany.get(c)!;
  };
  COMPANIES.forEach(ensure);
  rows.forEach((r) => ensure(r.company)[r.role === "staff" ? "staff" : "leaders"].push(r));
  const companies = [...COMPANIES, ...[...byCompany.keys()].filter((c) => !COMPANIES.includes(c)).sort()];
  const submittedCompanies = companies.filter((c) => byCompany.get(c)!.staff.length > 0).length;

  const tabs = (
    <nav className="tabs noprint" aria-label="현황판 탭">
      <Link href="/admin" className={activeTab === "status" ? "on" : ""} aria-current={activeTab === "status" ? "page" : undefined}>
        응답 현황
      </Link>
      <Link href="/admin?tab=overview" className={activeTab === "overview" ? "on" : ""} aria-current={activeTab === "overview" ? "page" : undefined}>
        전체 분포
      </Link>
    </nav>
  );

  if (activeTab === "overview") {
    return (
      <Shell>
        {tabs}
        <Overview />
        <form action={logout} style={{ marginTop: 16 }}>
          <button type="submit" className="btn small ghost">
            로그아웃
          </button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell>
      {tabs}
      <div className="kpis">
        <div className="kpi">
          <div className="kl">담당자 제출</div>
          <div className="kv">{staff.length}</div>
        </div>
        <div className="kpi">
          <div className="kl">제출한 계열사</div>
          <div className="kv">
            {submittedCompanies}
            <small style={{ fontSize: 13, color: "var(--sub)", fontWeight: 400 }}> / {companies.length}</small>
          </div>
        </div>
        <div className="kpi">
          <div className="kl">팀장 제출</div>
          <div className="kv">{leaders.length}</div>
        </div>
      </div>

      <div className="admin">
        <table>
          <thead>
            <tr>
              <th>계열사</th>
              <th>담당자 제출</th>
              <th>팀장 제출</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => {
              const g = byCompany.get(c)!;
              return (
                <tr key={c}>
                  <td>
                    {c}
                    {!COMPANIES.includes(c) && <span className="hint"> (직접 입력)</span>}
                  </td>
                  <td>
                    {g.staff.length === 0 ? (
                      <span className="no">미제출</span>
                    ) : (
                      g.staff.map((r) => (
                        <div key={r.id}>
                          <span className="ok">제출</span>{" "}
                          <span className="tm">
                            {fmt.format(new Date(r.created_at))}
                            {r.name ? `, ${r.name}` : ""}
                          </span>
                        </div>
                      ))
                    )}
                  </td>
                  <td>
                    {g.leaders.length === 0 ? (
                      <span className="no">미제출</span>
                    ) : (
                      g.leaders.map((r) => (
                        <div key={r.id}>
                          <span className="ok">{r.name}</span>{" "}
                          <span className="tm">{fmt.format(new Date(r.created_at))}</span>
                        </div>
                      ))
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="meta">점수는 표시하지 않습니다. 이 화면은 제출 여부와 제출 시각만 보여 줍니다. 새로고침하면 갱신됩니다.</p>
      <form action={logout} style={{ marginTop: 16 }}>
        <button type="submit" className="btn small ghost">
          로그아웃
        </button>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="band compact">
        <div className="inner">
          <p className="eyebrow">REALWORK | 조직변화 준비도 체크 | 진행자용</p>
          <h1>응답 현황</h1>
        </div>
      </div>
      <div className="wrap" style={{ paddingTop: 24 }}>
        {children}
      </div>
    </>
  );
}
