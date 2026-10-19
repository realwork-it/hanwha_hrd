"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CONFIG, ITEM_IDS } from "@/lib/config";
import { COMPANIES, OTHER_COMPANY } from "@/lib/companies";
import type { Answers } from "@/lib/score";

type Role = "staff" | "leader";

interface Props {
  role: Role;
}

interface Draft {
  companySel: string;
  companyText: string;
  name: string;
  answers: Answers;
}

const draftKey = (role: Role) => `odr_draft_${role}`;
const pendingKey = (role: Role) => `odr_pending_${role}`;

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
    /* 저장 공간이 없어도 진행은 막지 않는다 */
  }
}
function remove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export default function SurveyApp({ role }: Props) {
  const router = useRouter();
  const [companySel, setCompanySel] = useState("");
  const [companyText, setCompanyText] = useState("");
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPending, setHasPending] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const companyTextRef = useRef<HTMLInputElement>(null);

  // 임시 저장분 복원. 제출 실패로 보관된 응답이 있으면 그것을 우선한다.
  useEffect(() => {
    const pending = loadJSON<Draft>(pendingKey(role));
    const draft = pending ?? loadJSON<Draft>(draftKey(role));
    if (draft) {
      // localStorage 복원은 마운트 후에만 가능하다. 초기 렌더와 서버 HTML을 맞추기 위한 의도된 setState다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCompanySel(draft.companySel ?? "");
      setCompanyText(draft.companyText ?? "");
      setName(draft.name ?? "");
      setAnswers(draft.answers ?? {});
      // 비제어 입력란에는 값을 직접 넣는다. 직접 입력란은 복원된 상태로 마운트되므로 defaultValue가 처리한다.
      if (nameRef.current) nameRef.current.value = draft.name ?? "";
    }
    setHasPending(!!pending);
    setHydrated(true);
  }, [role]);

  // 입력이 바뀔 때마다 초안을 보관한다. 새로고침해도 응답이 남는다.
  useEffect(() => {
    if (!hydrated) return;
    saveJSON(draftKey(role), { companySel, companyText, name, answers } satisfies Draft);
  }, [hydrated, role, companySel, companyText, name, answers]);

  const company = (companySel === OTHER_COMPANY ? companyText : companySel).trim();
  const answered = ITEM_IDS.filter((id) => answers[id] != null).length;
  const total = ITEM_IDS.length;
  const allAnswered = answered === total;
  const nameOk = role === "staff" || name.trim().length > 0;
  const ready = allAnswered && company.length > 0 && nameOk;

  const missing = useMemo(() => {
    if (!showMissing) return new Set<string>();
    return new Set(ITEM_IDS.filter((id) => answers[id] == null));
  }, [showMissing, answers]);

  async function submit() {
    if (!ready) {
      setShowMissing(true);
      const first = ITEM_IDS.find((id) => answers[id] == null);
      if (!company) {
        document.getElementById("company")?.scrollIntoView({ block: "center" });
      } else if (!nameOk) {
        document.getElementById("name")?.scrollIntoView({ block: "center" });
      } else if (first) {
        document.getElementById(`q_${first}`)?.scrollIntoView({ block: "center" });
      }
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload = { role, company, name: name.trim() || null, answers };
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
      if (!res.ok || !data.token) throw new Error(data.error || `서버 응답 ${res.status}`);
      remove(pendingKey(role));
      remove(draftKey(role));
      router.push(`/r/${data.token}`);
    } catch (e) {
      // 와이파이가 끊겨도 응답이 날아가지 않도록 보관하고 재시도 버튼을 보여 준다.
      saveJSON(pendingKey(role), { companySel, companyText, name, answers } satisfies Draft);
      setHasPending(true);
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="start" id="start">
        <div className="field">
          <label htmlFor="company">
            계열사<span className="req" aria-hidden="true">*</span>
          </label>
          <select
            id="company"
            value={companySel}
            onChange={(e) => {
              const v = e.target.value;
              setCompanySel(v);
              // 직접 입력을 고르면 포커스를 입력란으로 옮긴다. 드롭다운에 포커스가 남아 타이핑이 먹히지 않는 문제를 막는다.
              if (v === OTHER_COMPANY) {
                requestAnimationFrame(() => companyTextRef.current?.focus());
              }
            }}
            required
            aria-required="true"
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
            <div className="other" key="other">
              <label htmlFor="companyText">
                계열사 이름 직접 입력<span className="req" aria-hidden="true">*</span>
              </label>
              {/* 한글 입력기와의 충돌을 피하려고 비제어 입력으로 두고 값만 상태에 복사한다 */}
              <input
                type="text"
                id="companyText"
                ref={companyTextRef}
                placeholder="예: 한화○○"
                defaultValue={companyText}
                onChange={(e) => setCompanyText(e.target.value)}
                maxLength={60}
                autoComplete="organization"
                inputMode="text"
              />
              <span className="hint">아래 칸에 회사 이름을 적어 주세요. 3일차에 팀장도 같은 이름을 적어야 비교가 됩니다.</span>
            </div>
          )}
          {role === "leader" && (
            <span className="hint">같은 계열사 담당자의 결과와 비교하려면 담당자와 같은 이름의 계열사를 골라야 합니다.</span>
          )}
        </div>
        <div className="field">
          <label htmlFor="name">
            {role === "leader" ? "이름이나 소속" : "이름"}
            {role === "leader" ? (
              <span className="req" aria-hidden="true">*</span>
            ) : (
              <span className="hint" style={{ fontWeight: 400, marginLeft: 6 }}>
                선택
              </span>
            )}
          </label>
          <input
            type="text"
            id="name"
            ref={nameRef}
            defaultValue=""
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder={role === "leader" ? "예: 홍길동 또는 생산1팀" : "비워 두어도 됩니다"}
            autoComplete="off"
            required={role === "leader"}
            aria-required={role === "leader"}
          />
          {role === "leader" && (
            <span className="hint">한 계열사에 팀장이 여러 명이라 구분 정보가 필요합니다.</span>
          )}
        </div>
      </div>

      <h2>진단지</h2>
      <p className="h2sub">모든 문항은 느낌이 아니라 장면을 묻습니다. 가장 가까운 것 하나를 고르세요.</p>

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

      <div ref={formRef} id="form" style={{ marginTop: 14 }}>
        {CONFIG.axes.map((ax) => (
          <section className="axis" key={ax.id}>
            <div className="axhead">
              <span className="axid">{ax.id}</span>
              <span className="axname">{ax.name}</span>
            </div>
            <p className="axwhy">{ax.why}</p>
            {ax.items.map((it) => (
              <div className={`q${missing.has(it.id) ? " missing" : ""}`} key={it.id} id={`q_${it.id}`}>
                <div className="qt">
                  {it.id}. {it.t}
                </div>
                <div className="opts" role="radiogroup" aria-label={`${it.id}. ${it.t}`}>
                  {it.o.map((o, i) => (
                    <label key={i}>
                      <input
                        type="radio"
                        name={`q_${it.id}`}
                        value={o[1]}
                        checked={answers[it.id] === o[1]}
                        onChange={() => setAnswers((a) => ({ ...a, [it.id]: o[1] }))}
                      />
                      <span>{o[0]}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>

      <div className="submitbar">
        {hasPending && !error && (
          <div className="alert info">
            이전에 제출하지 못한 응답이 이 기기에 남아 있어 그대로 불러왔습니다. 확인한 뒤 다시 제출하세요.
          </div>
        )}
        {error && (
          <div className="alert err" role="alert">
            제출이 되지 않았습니다. 응답은 이 기기에 보관되어 있으니 네트워크를 확인한 뒤 다시 시도하세요. ({error})
          </div>
        )}
        <div className="st">
          {allAnswered
            ? "15문항에 모두 응답했습니다."
            : `아직 ${total - answered}문항이 남았습니다. 모든 문항에 응답해야 제출할 수 있습니다.`}
          {!company && " 상단에서 계열사를 골라 주세요."}
          {company && !nameOk && " 상단에 이름이나 소속을 적어 주세요."}
        </div>
        <button type="button" className="btn" onClick={submit} disabled={submitting} aria-disabled={!ready}>
          {submitting ? "제출 중" : error ? "다시 제출" : "제출하고 결과지 보기"}
        </button>
      </div>
    </>
  );
}
