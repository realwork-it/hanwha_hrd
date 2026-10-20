"use client";

import { useCallback, useEffect, useState } from "react";
import { AX_ITEMS } from "@/lib/ax";
import type { AxCounts } from "@/app/admin/ax-data/route";

const REFRESH_MS = 30_000;

export default function AxOverview() {
  const [data, setData] = useState<AxCounts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [board, setBoard] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/admin/ax-data", { cache: "no-store" });
      if (!res.ok) throw new Error(`서버 응답 ${res.status}`);
      setData((await res.json()) as AxCounts);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기 실패");
    }
  }, []);

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

  return (
    <div className={`overview axov${board ? " board" : ""}`}>
      <div className="ovhead">
        <div>
          <div className="ovtitle">AX 퀵 서베이, 참가 조직의 답</div>
          <div className="ovsub">
            문항마다 보기별 응답 수와 비율입니다. 계열사 이름은 집계에만 쓰고 화면에는 내지 않습니다.
            {updated && (
              <span className="upd">
                응답 {total}건, 계열사 {data?.companies ?? 0}곳. 마지막 갱신 {updated}, 30초마다 자동 갱신.
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
                <span className="axname">{it.cat}</span>
              </div>
              <div className="axq">
                {it.t}
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
                  <span className="axmulti"> 주관식. 순서를 섞어 보여 줍니다</span>
                )}
              </div>
              {it.kind === "text" ? (
                <ul className="axtexts">
                  {(data?.texts.find((x) => x.id === it.id)?.answers ?? []).map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                  {(data?.texts.find((x) => x.id === it.id)?.answers.length ?? 0) === 0 && <li className="none">아직 적힌 내용이 없습니다.</li>}
                </ul>
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
              {idx === 0 && focus && (
                <button type="button" className="btn small ghost noprint" style={{ marginTop: 10 }} onClick={() => setFocus(null)}>
                  모든 문항 보기
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!focus && (
        <div className="ovfoot noprint">
          <span>한 문항만 크게:</span>
          {AX_ITEMS.map((it, i) => (
            <button type="button" className="axpick" key={it.id} onClick={() => setFocus(it.id)}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
