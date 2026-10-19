"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONFIG, QUADRANT_CELLS, type QuadrantKey } from "@/lib/config";
import { f1, pos } from "@/lib/score";
import type { OverviewData, OverviewPoint } from "@/lib/overview-types";

const REFRESH_MS = 30_000;
const W = 640;
const H = 560;
const PAD = { l: 48, r: 16, t: 16, b: 44 };
const PW = W - PAD.l - PAD.r;
const PH = H - PAD.t - PAD.b;

interface Cluster {
  key: string;
  x: number;
  y: number;
  who: "staff" | "leader";
  items: OverviewPoint[];
}

function clusters(points: OverviewPoint[], who: "staff" | "leader"): Cluster[] {
  const map = new Map<string, Cluster>();
  for (const p of points) {
    const key = `${who}_${p.mo.toFixed(3)}_${p.ca.toFixed(3)}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        x: PAD.l + (pos(p.ca) / 100) * PW,
        y: PAD.t + ((100 - pos(p.mo)) / 100) * PH,
        who,
        items: [],
      });
    }
    map.get(key)!.items.push(p);
  }
  return [...map.values()];
}

const QUADS: { key: QuadrantKey; x: number; y: number }[] = [
  { key: "hilo", x: 0, y: 0 },
  { key: "hihi", x: 1, y: 0 },
  { key: "lolo", x: 0, y: 1 },
  { key: "lohi", x: 1, y: 1 },
];

export default function Overview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNames, setShowNames] = useState(false);
  // 표시 집단. 1일차에는 담당자만 있고, 3일차에는 팀장만 보거나 둘을 겹쳐 본다.
  const [mode, setMode] = useState<"staff" | "leader" | "both">("staff");
  const [board, setBoard] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/admin/data", { cache: "no-store" });
      if (!res.ok) throw new Error(`서버 응답 ${res.status}`);
      setData((await res.json()) as OverviewData);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기 실패");
    }
  }, []);

  useEffect(() => {
    // 첫 호출은 다음 틱으로 미뤄 렌더 중 상태 변경을 피한다. 이후 30초마다 갱신한다.
    const first = setTimeout(load, 0);
    const t = setInterval(load, REFRESH_MS);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [load]);

  // 전체 화면 모드. Esc로 빠져나온다.
  useEffect(() => {
    if (!board) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setBoard(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [board]);

  async function enterBoard() {
    setBoard(true);
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      /* 전체 화면 API가 막혀 있어도 큰 화면 배치는 적용된다 */
    }
  }
  async function exitBoard() {
    setBoard(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* noop */
    }
  }

  const staff = useMemo(() => data?.staff ?? [], [data]);
  const leaders = useMemo(() => data?.leaders ?? [], [data]);
  const showStaff = mode !== "leader";
  const showLeaders = mode !== "staff";
  const staffClusters = useMemo(() => (showStaff ? clusters(staff, "staff") : []), [staff, showStaff]);
  const leaderClusters = useMemo(() => (showLeaders ? clusters(leaders, "leader") : []), [leaders, showLeaders]);
  const countBy = (arr: OverviewPoint[]) => {
    const c: Record<QuadrantKey, number> = { hihi: 0, hilo: 0, lohi: 0, lolo: 0 };
    arr.forEach((p) => (c[p.quadrant as QuadrantKey] += 1));
    return c;
  };
  const staffCounts = useMemo(() => countBy(staff), [staff]);
  const leaderCounts = useMemo(() => countBy(leaders), [leaders]);
  const avg = (arr: OverviewPoint[], k: "mo" | "ca") => (arr.length ? arr.reduce((s, p) => s + p[k], 0) / arr.length : 0);
  const cutX = PAD.l + PW / 2;
  const cutY = PAD.t + PH / 2;
  const updated = data ? new Date(data.updatedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "";

  return (
    <div ref={wrapRef} className={`overview${board ? " board" : ""}`}>
      <div className="ovhead">
        <div>
          <div className="ovtitle">변화를 원하는 힘과 해낼 힘의 좌표, 응답 분포</div>
          <div className="ovsub">
            {mode === "leader"
              ? "팀장 응답을 모두 점으로 찍었습니다."
              : mode === "both"
                ? "파란 점은 계열사마다 가장 최근 담당자 응답 1건, 주황 점은 팀장 응답입니다."
                : "계열사마다 가장 최근 담당자 응답 1건을 점으로 찍었습니다."}{" "}
            같은 자리에 겹치면 점이 커지고 수가 적힙니다.
            {updated && <span className="upd">마지막 갱신 {updated}, 30초마다 자동 갱신.</span>}
          </div>
        </div>
        <div className="ovctl noprint">
          <label>
            <input type="checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} /> 계열사 이름 표시
          </label>
          <span className="ovmode" role="radiogroup" aria-label="표시할 응답">
            <span className="ovmodel">표시</span>
            <label>
              <input type="radio" name="ovmode" checked={mode === "staff"} onChange={() => setMode("staff")} /> <i className="st" />
              담당자
            </label>
            <label className={leaders.length === 0 ? "off" : ""}>
              <input type="radio" name="ovmode" checked={mode === "leader"} disabled={leaders.length === 0} onChange={() => setMode("leader")} />{" "}
              <i className="ld" />
              팀장{leaders.length === 0 ? " (아직 없음)" : ""}
            </label>
            <label className={leaders.length === 0 ? "off" : ""}>
              <input type="radio" name="ovmode" checked={mode === "both"} disabled={leaders.length === 0} onChange={() => setMode("both")} /> 함께
            </label>
          </span>
          {board ? (
            <button type="button" className="btn small ghost" onClick={exitBoard}>
              전체 화면 닫기 (Esc)
            </button>
          ) : (
            <button type="button" className="btn small" onClick={enterBoard}>
              전체 화면으로 보기
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert err">분포를 불러오지 못했습니다. ({error})</div>}

      <div className="ovbody">
        <div className="ovchart">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="담당자 응답의 좌표 분포">
            {QUADS.map((q) => (
              <g key={q.key}>
                <rect
                  x={PAD.l + (q.x * PW) / 2}
                  y={PAD.t + (q.y * PH) / 2}
                  width={PW / 2}
                  height={PH / 2}
                  className="ovcell"
                />
                <text x={PAD.l + (q.x * PW) / 2 + 12} y={PAD.t + (q.y * PH) / 2 + 24} className="ovcellt">
                  {QUADRANT_CELLS[q.key].title}
                </text>
                <text x={PAD.l + (q.x * PW) / 2 + 12} y={PAD.t + (q.y * PH) / 2 + 44} className="ovcells">
                  {QUADRANT_CELLS[q.key].sub}
                </text>
                <text
                  x={PAD.l + (q.x * PW) / 2 + PW / 2 - 14}
                  y={PAD.t + (q.y * PH) / 2 + PH / 2 - 26}
                  className="ovcount"
                  textAnchor="end"
                >
                  {showStaff && <tspan className="st">{staffCounts[q.key]}</tspan>}
                  {showStaff && showLeaders && <tspan className="sep"> / </tspan>}
                  {showLeaders && <tspan className="ld">{leaderCounts[q.key]}</tspan>}
                </text>
                <text
                  x={PAD.l + (q.x * PW) / 2 + PW / 2 - 14}
                  y={PAD.t + (q.y * PH) / 2 + PH / 2 - 10}
                  className="ovcountl"
                  textAnchor="end"
                >
                  {mode === "staff" ? "계열사" : mode === "leader" ? "팀장" : "담당자 / 팀장"}
                </text>
              </g>
            ))}
            <line x1={cutX} y1={PAD.t} x2={cutX} y2={PAD.t + PH} className="ovcut" />
            <line x1={PAD.l} y1={cutY} x2={PAD.l + PW} y2={cutY} className="ovcut" />
            <text x={PAD.l + PW / 2} y={H - 12} textAnchor="middle" className="ovaxis">
              변화를 해낼 힘 →
            </text>
            <text
              x={12}
              y={PAD.t + PH / 2}
              textAnchor="middle"
              className="ovaxis"
              transform={`rotate(-90 12 ${PAD.t + PH / 2})`}
            >
              변화를 원하는 힘 →
            </text>
            <text x={PAD.l - 6} y={PAD.t + PH + 4} textAnchor="end" className="ovtick">1</text>
            <text x={PAD.l - 6} y={cutY + 4} textAnchor="end" className="ovtick">{CONFIG.CUT}</text>
            <text x={PAD.l - 6} y={PAD.t + 8} textAnchor="end" className="ovtick">4</text>
            <text x={PAD.l} y={PAD.t + PH + 16} textAnchor="middle" className="ovtick">1</text>
            <text x={cutX} y={PAD.t + PH + 16} textAnchor="middle" className="ovtick">{CONFIG.CUT}</text>
            <text x={PAD.l + PW} y={PAD.t + PH + 16} textAnchor="middle" className="ovtick">4</text>

            {[...staffClusters, ...leaderClusters].map((c) => {
              const n = c.items.length;
              const r = 9 + Math.sqrt(n - 1) * 6;
              return (
                <g key={c.key} className={`ovdot ${c.who}`}>
                  <circle cx={c.x} cy={c.y} r={r} />
                  {n > 1 && (
                    <text x={c.x} y={c.y + 4} textAnchor="middle" className="ovn">
                      {n}
                    </text>
                  )}
                  {showNames && (
                    <text x={c.x + r + 4} y={c.y + 4} className="ovname">
                      {c.items.map((p) => (c.who === "leader" && p.name ? `${p.company} ${p.name}` : p.company)).join(", ")}
                    </text>
                  )}
                  <title>
                    {c.items.map((p) => `${p.company}${p.name ? " " + p.name : ""} (원하는 힘 ${f1(p.mo)}, 해낼 힘 ${f1(p.ca)})`).join("\n")}
                  </title>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="ovside">
          {showStaff && (
            <div className="kpi">
              <div className="kl">응답한 계열사 수</div>
              <div className="kv st">{staff.length}</div>
            </div>
          )}
          {showLeaders && (
            <div className="kpi">
              <div className="kl">응답한 팀장 수</div>
              <div className="kv ld">{leaders.length}</div>
            </div>
          )}
          <div className="kpi">
            <div className="kl">변화를 원하는 힘 평균</div>
            {showStaff && <div className="kv st">{staff.length ? f1(avg(staff, "mo")) : "-"}{showLeaders && <small> 담당자</small>}</div>}
            {showLeaders && <div className="kv ld">{leaders.length ? f1(avg(leaders, "mo")) : "-"}{showStaff && <small> 팀장</small>}</div>}
          </div>
          <div className="kpi">
            <div className="kl">변화를 해낼 힘 평균</div>
            {showStaff && <div className="kv st">{staff.length ? f1(avg(staff, "ca")) : "-"}{showLeaders && <small> 담당자</small>}</div>}
            {showLeaders && <div className="kv ld">{leaders.length ? f1(avg(leaders, "ca")) : "-"}{showStaff && <small> 팀장</small>}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
