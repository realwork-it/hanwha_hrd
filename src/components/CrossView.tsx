// 2차 교차 보기. 팀장 응답과 같은 계열사 담당자 응답을 한 화면에 놓는다.
import Link from "next/link";
import { CONFIG, QUADRANT_CELLS, type QuadrantKey } from "@/lib/config";
import { f1, pos, type Scored } from "@/lib/score";
import { Badge } from "./ResultSheet";

export interface StaffOption {
  id: string;
  label: string;
}

interface Props {
  leader: Scored;
  staff: Scored;
  staffLabel: string;
  staffOptions: StaffOption[];
  currentStaffId: string;
  leaderToken: string;
}

const forceNote = (f: string) => (f === "mo" ? "동력" : f === "ca" ? "역량" : "동력과 역량");

export default function CrossView({ leader, staff, staffLabel, staffOptions, currentStaffId, leaderToken }: Props) {
  const CUT = CONFIG.CUT;
  const cellOrder: QuadrantKey[] = ["hilo", "hihi", "lolo", "lohi"];

  // 차이가 큰 영역. 0.5점 이상 차이 나는 영역을 큰 순으로 최대 두 개.
  const gaps = leader.axes
    .map((ax, i) => ({ ax, s: staff.axes[i], d: Math.abs(ax.score - staff.axes[i].score) }))
    .sort((a, b) => b.d - a.d);
  const bigGaps = gaps.filter((g) => g.d >= 0.5).slice(0, 2);
  const topGap = gaps[0];

  return (
    <>
      <div className="cross-band" id="cross">
        <div className="rt">교차 보기</div>
        <div className="rs">팀장인 나의 응답과 같은 계열사 조직문화 담당자의 응답을 나란히 놓았습니다.</div>
      </div>
      <div className="rbody">
        <div className="rblock">
          {staffOptions.length > 1 && (
            <p className="staffpick">
              같은 계열사의 담당자 응답이 {staffOptions.length}건 있어 가장 최근 응답을 기본으로 보여 줍니다. 다른 응답과 비교하려면 고르세요.{" "}
              {staffOptions.map((o) =>
                o.id === currentStaffId ? (
                  <b key={o.id} style={{ marginRight: 10 }}>
                    {o.label}
                  </b>
                ) : (
                  <Link key={o.id} href={`/r/${leaderToken}?staff=${o.id}`}>
                    {o.label}
                  </Link>
                ),
              )}
            </p>
          )}
          <h3>
            <span className="bn">가</span>변화를 원하는 힘과 해낼 힘의 좌표, 두 점
          </h3>
          <p className="bs">비교 대상 담당자 응답: {staffLabel}</p>
          <div className="legend">
            <span className="lg-leader">팀장 (나)</span>
            <span className="lg-staff">담당자</span>
          </div>
          <div className="coordwrap">
            <div className="coordbox">
              <div className="axlab v">
                <span className="lab">
                  <span className="arr-v">↑ </span>변화를 원하는 힘<span className="arr-h"> →</span>
                </span>
              </div>
              <div className="coord">
                <div className="grid2">
                  {cellOrder.map((k) => (
                    <div className={`cell${k === leader.quadrant ? " on" : ""}`} key={k}>
                      <b>{QUADRANT_CELLS[k].title}</b>
                      {QUADRANT_CELLS[k].sub}
                    </div>
                  ))}
                  <div className="dot" style={{ left: `${pos(staff.ca)}%`, bottom: `${pos(staff.mo)}%` }} />
                  <div className="dotlab staff" style={{ left: `${pos(staff.ca)}%`, bottom: `${pos(staff.mo)}%` }}>
                    담당자
                  </div>
                  <div className="dot leader" style={{ left: `${pos(leader.ca)}%`, bottom: `${pos(leader.mo)}%` }} />
                  <div className="dotlab leader" style={{ left: `${pos(leader.ca)}%`, bottom: `${pos(leader.mo)}%` }}>
                    팀장
                  </div>
                </div>
                <div className="axlab">변화를 해낼 힘 →</div>
              </div>
            </div>
            <div className="coordside">
              <div className="scorepair">
                <div className="scorebox">
                  <div className="sl">변화를 원하는 힘</div>
                  <div className="sv" style={{ fontSize: 18 }}>
                    <span style={{ color: "var(--leader)" }}>팀장 {f1(leader.mo)}</span>
                    <Badge v={leader.mo} />
                  </div>
                  <div className="sv" style={{ fontSize: 18 }}>
                    <span style={{ color: "var(--accent)" }}>담당자 {f1(staff.mo)}</span>
                    <Badge v={staff.mo} />
                  </div>
                </div>
                <div className="scorebox">
                  <div className="sl">변화를 해낼 힘</div>
                  <div className="sv" style={{ fontSize: 18 }}>
                    <span style={{ color: "var(--leader)" }}>팀장 {f1(leader.ca)}</span>
                    <Badge v={leader.ca} />
                  </div>
                  <div className="sv" style={{ fontSize: 18 }}>
                    <span style={{ color: "var(--accent)" }}>담당자 {f1(staff.ca)}</span>
                    <Badge v={staff.ca} />
                  </div>
                </div>
              </div>
              <p className="cutnote">색이 칠해진 셀은 팀장 응답 기준의 상태입니다. 담당자 응답의 상태는 아래 접근 전략 비교에서 확인하세요.</p>
            </div>
          </div>
        </div>

        <div className="rblock">
          <h3>
            <span className="bn">나</span>여섯 영역 프로파일 비교
          </h3>
          <p className="bs">영역마다 위 막대가 팀장, 아래 막대가 담당자입니다. 점선은 기준선 2.75입니다.</p>
          <div className="bars">
            {leader.axes.map((ax, i) => (
              <div className="brow2" key={ax.id}>
                <div className="bl">
                  {ax.id}. {ax.name}
                  <small>{forceNote(ax.force)}</small>
                </div>
                <div className="track">
                  <div className="fill leader" style={{ width: `${(ax.score / 4) * 100}%` }} />
                  <div className="cutline" style={{ left: `${(CUT / 4) * 100}%` }} />
                </div>
                <div className="bval leader">{f1(ax.score)}</div>
                <div className="track">
                  <div className="fill" style={{ width: `${(staff.axes[i].score / 4) * 100}%` }} />
                  <div className="cutline" style={{ left: `${(CUT / 4) * 100}%` }} />
                </div>
                <div className="bval staff">{f1(staff.axes[i].score)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rblock">
          <h3>
            <span className="bn">다</span>서로 다르게 보고 있는 영역
          </h3>
          <p className="bs">
            차이는 틀린 것이 아니라 서로 다르게 보고 있다는 신호입니다. 아래 영역을 담당자와의 대화 주제로 삼으시기를 권합니다.
          </p>
          {bigGaps.length > 0 ? (
            bigGaps.map((g) => (
              <div className="gapcard" key={g.ax.id}>
                <div className="gn">
                  {g.ax.id}. {g.ax.name}
                </div>
                <div className="gv">
                  <b className="leader">팀장 {f1(g.ax.score)}</b>, <b className="staff">담당자 {f1(g.s.score)}</b>, 차이 {f1(g.d)}점.{" "}
                  {g.ax.score > g.s.score ? "팀장이 더 높게 보고 있습니다." : "담당자가 더 높게 보고 있습니다."}
                </div>
              </div>
            ))
          ) : (
            <div className="gapcard">
              <div className="gn">두 응답이 대체로 비슷합니다</div>
              <div className="gv">
                가장 차이가 큰 영역은 {topGap.ax.id}. {topGap.ax.name}이고 차이는 {f1(topGap.d)}점입니다. 0.5점 이상 벌어진 영역은
                없습니다. 이 영역부터 서로 어떤 장면을 떠올렸는지 이야기해 보시기를 권합니다.
              </div>
            </div>
          )}
        </div>

        <div className="rblock">
          <h3>
            <span className="bn">라</span>접근 전략과 제언, 각자의 응답 기준
          </h3>
          <p className="bs">접근 전략과 제언은 각자의 응답으로 따로 계산합니다. 팀장의 전체 결과지는 위에 있습니다.</p>
          <div className="twocol">
            <Column who="leader" title="팀장 (나)" s={leader} />
            <Column who="staff" title="담당자" s={staff} />
          </div>
        </div>
      </div>
    </>
  );
}

function Column({ who, title, s }: { who: "leader" | "staff"; title: string; s: Scored }) {
  const qd = CONFIG.quadrants[s.quadrant];
  return (
    <div className="col">
      <div className={`ch ${who}`}>{title}</div>
      <div className="cn">{qd.name}</div>
      <div className="cs">{qd.strat}</div>
      <div className="cs" style={{ marginTop: 8, fontWeight: 700 }}>
        낮은 영역에 대한 제언
      </div>
      {s.flagged.length > 0 ? (
        <ul>
          {s.flagged.map((r) => (
            <li key={r.key}>
              {r.name} ({f1(r.score)} /4). {r.rx}
            </li>
          ))}
        </ul>
      ) : (
        <div className="cs" style={{ color: "var(--sub)" }}>
          기준에 크게 못 미친 영역이 없습니다.
        </div>
      )}
    </div>
  );
}
