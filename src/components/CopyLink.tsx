"use client";

import { useState, useSyncExternalStore } from "react";

const noop = () => () => {};
const getHref = () => window.location.origin + window.location.pathname;
const getServerHref = () => "";

export default function CopyLink() {
  // 서버 렌더에서는 빈 문자열, 클라이언트에서는 현재 주소를 쓴다.
  const url = useSyncExternalStore(noop, getHref, getServerHref);
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setState("done");
    } catch {
      setState("fail");
    }
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <div className="linkbox noprint">
      <div className="lt">
        <b>이 링크로 다시 볼 수 있습니다</b>
        <span className="lu">{url}</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="btn small" onClick={copy}>
          {state === "done" ? "복사됨" : state === "fail" ? "주소창에서 복사하세요" : "링크 복사"}
        </button>
        <button type="button" className="btn small ghost" onClick={() => window.print()}>
          인쇄 또는 PDF 저장
        </button>
      </div>
    </div>
  );
}
