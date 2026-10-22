import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db, type ResponseRow } from "@/lib/db";
import { score } from "@/lib/score";
import ResultSheet from "@/components/ResultSheet";
import CrossView, { type StaffOption } from "@/components/CrossView";
import CopyLink from "@/components/CopyLink";
import SiteFooter from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "결과지 | 조직변화 준비도 체크",
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

const staffLabel = (r: ResponseRow) =>
  `${r.name ? r.name + ", " : ""}${fmt.format(new Date(r.created_at))} 제출`;

export default async function ResultPage({
  params,
  searchParams,
}: PageProps<"/r/[token]">) {
  const { token } = await params;
  const { staff: staffParam } = await searchParams;
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) notFound();

  const row = await db().getByToken(token);
  if (!row) notFound();
  const mine = score(row.answers);

  // 팀장이면 같은 계열사 담당자 응답을 찾는다. 기본은 최신 1건, 쿼리로 다른 응답을 고를 수 있다.
  let staffRows: ResponseRow[] = [];
  let staffRow: ResponseRow | null = null;
  if (row.role === "leader") {
    staffRows = await db().listStaffByCompany(row.company);
    const wanted = typeof staffParam === "string" ? staffParam : null;
    staffRow =
      (wanted && staffRows.find((r) => r.id === wanted)) ||
      staffRows[0] ||
      null;
  }
  const staffOptions: StaffOption[] = staffRows.map((r) => ({
    id: r.id,
    label: staffLabel(r),
  }));

  return (
    <>
      <div className={row.role === "leader" ? "theme-leader" : undefined}>
        <div className="band compact">
          <div className="inner">
            <p className="eyebrow">
              REALWORK | 조직변화 준비도 체크 |{" "}
              {row.role === "leader" ? "팀장용 결과지" : "담당자용 결과지"}
            </p>
            <h1>조직변화 준비도 체크 결과지</h1>
            <p className="lede" style={{ fontSize: 14 }}>
              {row.company}
              {row.name ? `, ${row.name}` : ""} |{" "}
              {fmt.format(new Date(row.created_at))} 제출
            </p>
          </div>
        </div>
      </div>

      <div className="wrap">
        <CopyLink />

        {/* 팀장은 자기 결과를 3번까지만 보고 바로 교차 보기로 넘어간다. 팀장 색은 자기 결과까지만 */}
        <div className={row.role === "leader" ? "theme-leader" : undefined}>
          <ResultSheet scored={mine} upto={row.role === "leader" ? 3 : 6} />
        </div>

        {row.role === "leader" &&
          (staffRow ? (
            <CrossView
              leader={mine}
              staff={score(staffRow.answers)}
              staffLabel={staffLabel(staffRow)}
              staffOptions={staffOptions}
              currentStaffId={staffRow.id}
              leaderToken={row.token}
            />
          ) : (
            <>
              <div className="cross-band" id="cross">
                <div className="rt">교차 보기</div>
                <div className="rs">
                  같은 계열사 조직문화 담당자의 응답과 비교하는 화면입니다.
                </div>
              </div>
              <div className="rbody">
                <div className="rblock">
                  <div className="rxnone">
                    {row.company}의 조직문화 담당자 응답이 아직 없어 비교는
                    생략합니다. 담당자가 응답하면 이 링크를 다시 열었을 때 교차
                    보기가 표시됩니다.
                  </div>
                </div>
              </div>
            </>
          ))}

        <p className="meta noprint">
          결과지는 이 링크를 아는 사람만 볼 수 있습니다. 링크를 잃어버리면 다시
          응답해야 하니 메모 앱이나 메신저에 보내 두세요.
        </p>
        <SiteFooter />
      </div>
    </>
  );
}
