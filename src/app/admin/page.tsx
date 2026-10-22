import type { Metadata } from "next";
import { db, type ResponseSummary } from "@/lib/db";
import { COMPANIES } from "@/lib/companies";
import { isAuthed } from "./auth";
import { login, logout } from "./actions";
import Overview from "@/components/Overview";
import AxOverview from "@/components/AxOverview";
import AutoRefresh from "@/components/AutoRefresh";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "응답 대시보드 | 조직변화 준비도 체크",
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
  const activeTab =
    tab === "overview"
      ? "overview"
      : tab === "ax"
        ? "ax"
        : tab === "ax-leader"
          ? "ax-leader"
          : tab === "status-leader"
            ? "status-leader"
            : "status";
  const authed = await isAuthed();

  if (!authed) {
    return (
      <Shell>
        <div className="start" style={{ maxWidth: 420 }}>
          <form action={login}>
            <div className="field">
              <label htmlFor="password">진행자 비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoFocus
              />
              {error && (
                <span className="hint" style={{ color: "var(--red)" }}>
                  비밀번호가 맞지 않습니다.
                </span>
              )}
              {!process.env.ADMIN_PASSWORD && (
                <span className="hint" style={{ color: "var(--red)" }}>
                  ADMIN_PASSWORD 환경 변수가 설정되지 않아 로그인할 수 없습니다.
                </span>
              )}
            </div>
            <button type="submit" className="btn">
              대시보드 열기
            </button>
          </form>
        </div>
      </Shell>
    );
  }

  const rows = await db().listAll();
  const staff = rows.filter((r) => r.role === "staff");
  const leaders = rows.filter((r) => r.role === "leader");
  const byCompany = new Map<
    string,
    { staff: ResponseSummary[]; leaders: ResponseSummary[] }
  >();
  const ensure = (c: string) => {
    if (!byCompany.has(c)) byCompany.set(c, { staff: [], leaders: [] });
    return byCompany.get(c)!;
  };
  COMPANIES.forEach(ensure);
  rows.forEach((r) =>
    ensure(r.company)[r.role === "staff" ? "staff" : "leaders"].push(r),
  );
  const companies = [
    ...COMPANIES,
    ...[...byCompany.keys()].filter((c) => !COMPANIES.includes(c)).sort(),
  ];
  // 제출 현황 탭은 담당자와 팀장을 따로 보여 준다. 워크숍 중에 팀장 제출만 실시간으로 보기 위해서다.
  const statusRole: "staff" | "leaders" =
    activeTab === "status-leader" ? "leaders" : "staff";
  const statusRows = statusRole === "staff" ? staff : leaders;
  const statusLabel = statusRole === "staff" ? "담당자" : "팀장";
  const submittedCompanies = companies.filter(
    (c) => byCompany.get(c)![statusRole].length > 0,
  ).length;

  const tabs = (
    <nav className="tabs noprint" aria-label="대시보드 탭">
      <Link
        href="/admin"
        className={activeTab === "status" ? "on" : ""}
        aria-current={activeTab === "status" ? "page" : undefined}
      >
        제출 현황 (담당자)
      </Link>
      <Link
        href="/admin?tab=status-leader"
        className={activeTab === "status-leader" ? "on leader" : "leader"}
        aria-current={activeTab === "status-leader" ? "page" : undefined}
      >
        제출 현황 (팀장)
      </Link>
      <Link
        href="/admin?tab=overview"
        className={activeTab === "overview" ? "on" : ""}
        aria-current={activeTab === "overview" ? "page" : undefined}
      >
        변화 준비도 분석
      </Link>
      <Link
        href="/admin?tab=ax"
        className={activeTab === "ax" ? "on" : ""}
        aria-current={activeTab === "ax" ? "page" : undefined}
      >
        조직 AX 현황 분석 (담당자)
      </Link>
      <Link
        href="/admin?tab=ax-leader"
        className={activeTab === "ax-leader" ? "on leader" : "leader"}
        aria-current={activeTab === "ax-leader" ? "page" : undefined}
      >
        조직 AX 현황 분석 (팀장)
      </Link>
    </nav>
  );

  if (activeTab === "ax" || activeTab === "ax-leader") {
    return (
      <Shell
        title={
          activeTab === "ax"
            ? "조직 AX 현황 분석 (담당자)"
            : "조직 AX 현황 분석 (팀장)"
        }
      >
        {tabs}
        <div className={activeTab === "ax-leader" ? "theme-leader" : undefined}>
          <AxOverview role={activeTab === "ax" ? "staff" : "leader"} />
        </div>
        <form action={logout} style={{ marginTop: 16 }}>
          <button type="submit" className="btn small ghost">
            로그아웃
          </button>
        </form>
      </Shell>
    );
  }

  if (activeTab === "overview") {
    return (
      <Shell title="변화 준비도 분석">
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
    <Shell title={`제출 현황 (${statusLabel})`}>
      {tabs}
      <AutoRefresh seconds={30} />
      <div className={statusRole === "leaders" ? "theme-leader" : undefined}>
        <div className="kpis">
          <div className="kpi">
            <div className="kl">{statusLabel} 제출</div>
            <div className="kv">{statusRows.length}</div>
          </div>
          <div className="kpi">
            <div className="kl">제출한 계열사</div>
            <div className="kv">
              {submittedCompanies}
              <small
                style={{ fontSize: 13, color: "var(--sub)", fontWeight: 400 }}
              >
                {" "}
                / {companies.length}
              </small>
            </div>
          </div>
        </div>

        <div className="admin">
          <table>
            <thead>
              <tr>
                <th>계열사</th>
                <th>{statusLabel} 제출</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => {
                const g = byCompany.get(c)!;
                return (
                  <tr key={c}>
                    <td>
                      {c}
                      {!COMPANIES.includes(c) && (
                        <span className="hint"> (직접 입력)</span>
                      )}
                    </td>
                    <td>
                      {g[statusRole].length === 0 ? (
                        <span className="no">미제출</span>
                      ) : (
                        g[statusRole].map((r) => (
                          <div key={r.id}>
                            <span className="ok">{r.name || "제출"}</span>{" "}
                            <span className="tm">
                              {fmt.format(new Date(r.created_at))}
                            </span>{" "}
                            <a
                              className="rlink"
                              href={`/r/${r.token}`}
                              target="_blank"
                              rel="noopener"
                            >
                              결과지
                            </a>
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
      </div>

      <p className="meta">
        이 화면은 제출 여부와 제출 시각만 보여 주며 30초마다 자동 갱신됩니다.
        결과지는 새 창으로 열립니다.
      </p>
      <form action={logout} style={{ marginTop: 16 }}>
        <button type="submit" className="btn small ghost">
          로그아웃
        </button>
      </form>
    </Shell>
  );
}

function Shell({
  children,
  eyebrow = "REALWORK x Hanwha | 조직변화 준비도 체크 및 조직 AX 현황 | 응답 대시보드",
  title = "응답 대시보드",
}: {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
}) {
  return (
    <>
      <div className="band compact">
        <div className="inner">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="wrap" style={{ paddingTop: 24 }}>
        {children}
      </div>
    </>
  );
}
