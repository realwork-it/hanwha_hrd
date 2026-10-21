"use client";

import { useCallback, useEffect, useState } from "react";
import { AX_ITEMS } from "@/lib/ax";
import { AX_THEMES, AX_THEMES_META } from "@/lib/ax-themes";
import type { AxCounts } from "@/app/admin/ax-data/route";

const REFRESH_MS = 30_000;

export type AxRole = "staff" | "leader";
const ROLE_LABEL: Record<AxRole, string> = { staff: "담당자", leader: "팀장" };

export default function AxOverview({ role }: { role: AxRole }) {
  const [data, setData] = useState<AxCounts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [board, setBoard] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/admin/ax-data?role=${role}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`서버 응답 ${res.status}`);
      setData((await res.json()) as AxCounts);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기 실패");
    }
  }, [role]);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const t = setInterval(load, REFRESH_MS);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [load]);

  useEffect(() => {
    if (!board) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBoard(false);
      if (e.key === "ArrowRight") setFocus((f) => (f ? AX_ITEMS[Math.min(AX_ITEMS.length - 1, AX_ITEMS.findIndex((i) => i.id === f) + 1)].id : AX_ITEMS[0].id));
      if (e.key === "ArrowLeft") setFocus((f) => (f ? AX_ITEMS[Math.max(0, AX_ITEMS.findIndex((i) => i.id === f) - 1)].id : f));
    };
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
      /* noop */
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

  const total = data?.total ?? 0;
  const updated = data
    ? new Date(data.updatedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
    : "";
  const shown = focus ? AX_ITEMS.filter((i) => i.id === focus) : AX_ITEMS;
  const focusIdx = focus ? AX_ITEMS.findIndex((i) => i.id === focus) : -1;
  const showThemes = role === "staff";

  return (
    <div className={`overview axov${board ? " board" : ""}`}>
      <div className="ovhead">
        <div>
          <div className="ovtitle">조직 AX 현황 분석 결과 ({ROLE_LABEL[role]})</div>
          <div className="ovsub">
            {ROLE_LABEL[role]} 응답만 모은 집계입니다. 문항마다 보기별 응답 수와 비율이며, 계열사 이름은 집계에만 쓰고 화면에는 내지 않습니다.
            {updated && (
              <span className="upd">
                {ROLE_LABEL[role]} 응답 {total}건, 계열사 {data?.companies ?? 0}곳. 마지막 갱신 {updated}, 30초마다 자동 갱신.
              </span>
            )}
          </div>
        </div>
        <div className="ovctl noprint">
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

      {error && <div className="alert err">집계를 불러오지 못했습니다. ({error})</div>}

      <div className="axgrid">
        {shown.map((it, idx) => {
          const counts = data?.items.find((x) => x.id === it.id)?.counts ?? it.o.map(() => 0);
          const max = Math.max(1, ...counts);
          const n = AX_ITEMS.indexOf(it);
          return (
            <div className="axcard" key={it.id}>
              <div className="axch">
                <span className="axid">{n + 1}</span>
                <span className="axqt">{it.t}</span>
              </div>
              <div className="axq">
                {it.multi && <span className="axmulti"> 복수 응답, 최대 {it.multi}개. 비율은 응답자 수 기준</span>}
                {it.kind === "scale" && (
                  <span className="axmulti">
                    {" "}
                    5점 추이 문항. 평균{" "}
                    {(() => {
                      const n = counts.reduce((s, c) => s + c, 0);
                      const sum = counts.reduce((s, c, i) => s + c * (i + 1), 0);
                      return n ? (sum / n).toFixed(2) : "-";
                    })()}{" "}
                    / 5
                  </span>
                )}
                {it.kind === "text" && (
                  <span className="axmulti"> 주관식. {showThemes ? `${AX_THEMES_META.basedOn} 기준으로 묶음` : "순서를 섞어 보여 줍니다"}</span>
                )}
              </div>
              {it.kind === "text" ? (
                <div className="axthemes">
                  {!showThemes && <div className="axthnote">팀장 주관식은 세션 뒤에 주제로 묶어 정리합니다. 원문은 아래에서 펼쳐 봅니다.</div>}
                  {showThemes && it.id === AX_THEMES_META.itemId && (
                    <>
                      <div className="axthnote">{AX_THEMES_META.note}</div>
                      {AX_THEMES.map((th) => (
                        <div className="axtheme" key={th.title}>
                          <div className="axthh">
                            <span className="axtht">{th.title}</span>
                            <span className="axthn">{th.count}건</span>
                          </div>
                          <div className="axthd">{th.desc}</div>
                          <ul className="axthq">
                            {th.quotes.map((q) => (
                              <li key={q}>{q}</li>
                            ))}
                          </ul>
                          <div className="axthc">{th.cat}</div>
                        </div>
                      ))}
                    </>
                  )}
                  <details className="axraw noprint">
                    <summary>원문 전체 보기 ({data?.texts.find((x) => x.id === it.id)?.answers.length ?? 0}건, 순서 섞음)</summary>
                    <ul className="axtexts">
                      {(data?.texts.find((x) => x.id === it.id)?.answers ?? []).map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                      {(data?.texts.find((x) => x.id === it.id)?.answers.length ?? 0) === 0 && <li className="none">아직 적힌 내용이 없습니다.</li>}
                    </ul>
                  </details>
                </div>
              ) : (
              <div className="axbars">
                {it.o.map((o, i) => {
                  const c = counts[i];
                  const pct = total ? Math.round((c / total) * 100) : 0;
                  return (
                    <div className={`axrow${c === max && c > 0 ? " top" : ""}`} key={i}>
                      <div className="axlabel">{o}</div>
                      <div className="axtrack">
                        <div className="axfill" style={{ width: `${total ? (c / max) * 100 : 0}%` }} />
                      </div>
                      <div className="axval">
                        {c}
                        <small> {pct}%</small>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
              <div className="axfoot">
                {idx === 0 && focus && (
                  <div className="axnav noprint">
                    <button type="button" className="btn small ghost" disabled={focusIdx <= 0} onClick={() => setFocus(AX_ITEMS[focusIdx - 1].id)}>
                      이전 문항
                    </button>
                    <button type="button" className="btn small ghost" onClick={() => setFocus(null)}>
                      모든 문항 보기
                    </button>
                    <button type="button" className="btn small" disabled={focusIdx >= AX_ITEMS.length - 1} onClick={() => setFocus(AX_ITEMS[focusIdx + 1].id)}>
                      다음 문항
                    </button>
                  </div>
                )}
                <div className="axcat">{it.cat}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="ovfoot noprint">
        <span>한 문항만 크게:</span>
        {AX_ITEMS.map((it, i) => (
          <button
            type="button"
            className={`axpick${it.id === focus ? " on" : ""}`}
            key={it.id}
            aria-pressed={it.id === focus}
            onClick={() => setFocus(it.id === focus ? null : it.id)}
          >
            {i + 1}
          </button>
        ))}
        {focus && <span className="axhint">좌우 방향키로도 넘길 수 있습니다</span>}
      </div>
    </div>
  );
}
