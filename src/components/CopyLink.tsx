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
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      // 클립보드 API가 막힌 환경(일부 인앱 브라우저, 포커스 없는 창)에서는 옛 방식으로 한 번 더 시도한다.
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (!ok) {
      // 복사가 안 되면 주소를 선택해 두어 길게 눌러 복사할 수 있게 한다.
      const el = document.querySelector(".linkbox .lu");
      const sel = window.getSelection();
      if (el && sel) {
        const range = document.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    setState(ok ? "done" : "fail");
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
          {state === "done" ? "복사됨" : state === "fail" ? "선택된 주소를 길게 눌러 복사하세요" : "링크 복사"}
        </button>
        <button type="button" className="btn small ghost" onClick={() => window.print()}>
          인쇄 또는 PDF 저장
        </button>
      </div>
    </div>
  );
}
