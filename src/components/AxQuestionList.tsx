"use client";

// AX 퀵 서베이 문항 목록. 단독 화면(/ax)과 준비도 체크의 파트 2에서 같이 쓴다.
import { AX_ITEMS, AX_TEXT_MAX, type AxAnswers } from "@/lib/ax";

interface Props {
  answers: AxAnswers;
  onChange: (next: (prev: AxAnswers) => AxAnswers) => void;
  missing: Set<string>;
}

export default function AxQuestionList({ answers, onChange, missing }: Props) {
  // 복수 선택. 단독 보기를 고르면 나머지를 비우고, 최대 개수를 넘으면 더 고를 수 없다.
  function toggleMulti(itemId: string, idx: number, max: number, exclusive: number | undefined) {
    onChange((a) => {
      const cur = Array.isArray(a[itemId]) ? (a[itemId] as number[]) : [];
      if (cur.includes(idx)) return { ...a, [itemId]: cur.filter((n) => n !== idx) };
      if (idx === exclusive) return { ...a, [itemId]: [idx] };
      const base = exclusive != null ? cur.filter((n) => n !== exclusive) : cur;
      if (base.length >= max) return a;
      return { ...a, [itemId]: [...base, idx].sort((x, y) => x - y) };
    });
  }

  return (
    <div style={{ marginTop: 14 }}>
      {AX_ITEMS.map((it, idx) => (
        <section className="axis" key={it.id}>
          <div className={`q${missing.has(it.id) ? " missing" : ""}`} id={`ax_${it.id}`} style={{ borderTop: "none", paddingTop: 0 }}>
            <div className="qt">
              <span className="axid" style={{ fontSize: 15, marginRight: 8 }}>
                {idx + 1}
              </span>
              {it.t}
            </div>
            {it.kind === "text" ? (
              <div className="opts">
                <textarea
                  className="axtext"
                  name={`ax_${it.id}`}
                  rows={3}
                  maxLength={AX_TEXT_MAX}
                  placeholder="예: 회의 자료 초안을 AI가 먼저 쓰고 사람이 고치는 순서가 됐다"
                  value={typeof answers[it.id] === "string" ? (answers[it.id] as string) : ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChange((a) => ({ ...a, [it.id]: v }));
                  }}
                />
                <div className="hint" style={{ paddingLeft: 10 }}>
                  비워 두어도 제출됩니다. {typeof answers[it.id] === "string" ? (answers[it.id] as string).length : 0} / {AX_TEXT_MAX}자
                </div>
              </div>
            ) : it.multi ? (
              <div className="opts" role="group" aria-label={it.t}>
                {it.o.map((o, i) => {
                  const cur = Array.isArray(answers[it.id]) ? (answers[it.id] as number[]) : [];
                  const checked = cur.includes(i);
                  const full = cur.length >= (it.multi ?? 1) && !checked;
                  const lockedByExclusive = it.exclusive != null && cur.includes(it.exclusive) && i !== it.exclusive;
                  return (
                    <label key={i} className={full || lockedByExclusive ? "dim" : ""}>
                      <input
                        type="checkbox"
                        name={`ax_${it.id}`}
                        value={i}
                        checked={checked}
                        disabled={lockedByExclusive}
                        onChange={() => toggleMulti(it.id, i, it.multi ?? 1, it.exclusive)}
                      />
                      <span>{o}</span>
                    </label>
                  );
                })}
                <div className="hint" style={{ paddingLeft: 10 }}>
                  {(Array.isArray(answers[it.id]) ? (answers[it.id] as number[]).length : 0)} / {it.multi}개 선택
                </div>
              </div>
            ) : (
              <div className="opts" role="radiogroup" aria-label={it.t}>
                {it.o.map((o, i) => (
                  <label key={i}>
                    <input
                      type="radio"
                      name={`ax_${it.id}`}
                      value={i}
                      checked={answers[it.id] === i}
                      onChange={() => onChange((a) => ({ ...a, [it.id]: i }))}
                    />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
