"use client";

import { useEffect, useRef, useState } from "react";
import { AX_INTRO, AX_ITEMS, isAnswered, type AxAnswers } from "@/lib/ax";
import AxQuestionList from "./AxQuestionList";
import { COMPANIES, OTHER_COMPANY } from "@/lib/companies";

interface Draft {
  companySel: string;
  companyText: string;
  name: string;
  answers: AxAnswers;
}

const DRAFT = "ax_draft";
const PENDING = "ax_pending";

function loadJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function saveJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}
function remove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export default function AxSurvey() {
  const [companySel, setCompanySel] = useState("");
  const [companyText, setCompanyText] = useState("");
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<AxAnswers>({});
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMissing, setShowMissing] = useState(false);
  const companyTextRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const pending = loadJSON<Draft>(PENDING);
    const draft = pending ?? loadJSON<Draft>(DRAFT);
    if (draft) {
      // localStorage 복원은 마운트 후에만 가능하다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCompanySel(draft.companySel ?? "");
      setCompanyText(draft.companyText ?? "");
      setName(draft.name ?? "");
      setAnswers(draft.answers ?? {});
      if (nameRef.current) nameRef.current.value = draft.name ?? "";
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || done) return;
    saveJSON(DRAFT, { companySel, companyText, name, answers } satisfies Draft);
  }, [hydrated, done, companySel, companyText, name, answers]);

  const company = (companySel === OTHER_COMPANY ? companyText : companySel).trim();
  const answered = AX_ITEMS.filter((it) => isAnswered(it, answers[it.id])).length;
  const total = AX_ITEMS.length;
  const ready = answered === total && company.length > 0;
  const missing = showMissing ? new Set(AX_ITEMS.filter((it) => !isAnswered(it, answers[it.id])).map((it) => it.id)) : new Set<string>();

  async function submit() {
    if (!ready) {
      setShowMissing(true);
      const first = AX_ITEMS.find((it) => !isAnswered(it, answers[it.id]))?.id;
      if (!company) document.getElementById("ax_company")?.scrollIntoView({ block: "center" });
      else if (first) document.getElementById(`ax_${first}`)?.scrollIntoView({ block: "center" });
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/ax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, name: name.trim() || null, answers }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error || `서버 응답 ${res.status}`);
      remove(PENDING);
      remove(DRAFT);
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (e) {
      saveJSON(PENDING, { companySel, companyText, name, answers } satisfies Draft);
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="start" style={{ marginTop: 26 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>응답이 저장되었습니다</h2>
        <p style={{ margin: 0 }}>
          고맙습니다. 전체 결과는 다음 세션에서 함께 봅니다. 개인 응답과 계열사 이름은 화면에 나오지 않습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="start">
        <div className="field">
          <label htmlFor="ax_company">
            계열사<span className="req" aria-hidden="true">*</span>
          </label>
          <select
            id="ax_company"
            value={companySel}
            onChange={(e) => {
              const v = e.target.value;
              setCompanySel(v);
              if (v === OTHER_COMPANY) requestAnimationFrame(() => companyTextRef.current?.focus());
            }}
            required
          >
            <option value="">계열사를 고르세요</option>
            {COMPANIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value={OTHER_COMPANY}>목록에 없음 (직접 입력)</option>
          </select>
          {companySel === OTHER_COMPANY && (
            <div className="other">
              <label htmlFor="ax_companyText">
                계열사 이름 직접 입력<span className="req" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="ax_companyText"
                ref={companyTextRef}
                placeholder="예: 한화○○"
                defaultValue={companyText}
                onChange={(e) => setCompanyText(e.target.value)}
                maxLength={60}
                autoComplete="organization"
              />
            </div>
          )}
        </div>
        <div className="field">
          <label htmlFor="ax_name">이름 (선택 입력)</label>
          <input
            type="text"
            id="ax_name"
            ref={nameRef}
            defaultValue=""
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="비워 두어도 됩니다"
            autoComplete="off"
          />
        </div>
      </div>

      <h2>여덟 문항</h2>
      <p className="h2sub">
        {AX_INTRO} 느낌이 아니라 지금 보이고 들리는 장면에 가장 가까운 것을 고르세요. 모르면 모르겠다를 고르는 것도 답입니다.
      </p>

      <div className="progress" role="status" aria-live="polite">
        <div className="pl">
          <span>진행률</span>
          <span>
            <b>{answered}</b> / {total} 문항
          </span>
        </div>
        <div className="ptrack">
          <div className="pfill" style={{ width: `${(answered / total) * 100}%` }} />
        </div>
      </div>

      <AxQuestionList answers={answers} onChange={setAnswers} missing={missing} />

      <div className="submitbar">
        {error && (
          <div className="alert err" role="alert">
            제출이 되지 않았습니다. 응답은 이 기기에 보관되어 있으니 네트워크를 확인한 뒤 다시 시도하세요. ({error})
          </div>
        )}
        <div className="st">
          {answered === total ? "모든 문항에 응답했습니다." : `아직 ${total - answered}문항이 남았습니다.`}
          {!company && " 상단에서 계열사를 골라 주세요."}
        </div>
        <button type="button" className="btn" onClick={submit} disabled={submitting} aria-disabled={!ready}>
          {submitting ? "제출 중" : error ? "다시 제출" : "제출"}
        </button>
      </div>
    </>
  );
}
