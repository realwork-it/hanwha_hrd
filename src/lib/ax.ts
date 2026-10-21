// AX 퀵 서베이. 점수를 내지 않고 보기별 응답 수만 집계한다.
// 문항은 토론 자료 "AX 시대 조직문화를 묻는 여섯 개의 질문"의 범주를 렌즈로 삼되,
// 조직문화 담당자가 보고 듣는 장면으로 물어 답할 수 있게 했다. (2026-10-20 확정)

export interface AxItem {
  id: string;
  cat: string;
  t: string;
  o: readonly string[];
  /** 복수 선택 문항이면 최대 몇 개까지 고를 수 있는지 */
  multi?: number;
  /** 단독 선택 보기의 번호. 이것을 고르면 다른 보기를 함께 고를 수 없다 */
  exclusive?: number;
  /** scale은 5점 추이 문항(반복 비교용), text는 주관식(선택 입력). 없으면 장면 고르기 */
  kind?: "scale" | "text";
}

export const AX_INTRO = "회사 전체 또는 당신이 가장 잘 아는 조직(본부나 사업부)을 떠올려, 최근 3개월 안에 보고 들은 장면으로 답하세요.";

export const AX_ITEMS: readonly AxItem[] = [
  {
    id: "Q0",
    cat: "AI 활용의 현재 모습",
    t: "우리 조직에서 지금 AI 활용은 어떤 모습에 가장 가깝나?",
    o: [
      "회사가 공식 도구와 규칙을 정해 쓴다",
      "팀이나 부서가 알아서 정해 쓴다",
      "개인이 알아서 쓰고 서로 공유한다",
      "개인이 알아서 쓰고 드러내지 않는다",
      "거의 쓰지 않는다",
    ],
  },
  {
    id: "Q1",
    cat: "분배의 공정성",
    t: "AI로 일이 빨라져 시간이 남을 때, 가장 자주 들리는 말은?",
    o: [
      "\"덕분에 더 중요한 일을 한다\"",
      "\"일찍 끝내고 숨 돌린다\"",
      "\"그만큼 일이 더 들어온다\"",
      "\"빨라진 걸 굳이 말하지 않는다\"",
      "아직 시간이 줄었다는 말 자체가 없다",
      "잘 모르겠다",
    ],
  },
  {
    id: "Q2",
    cat: "제도의 시차",
    t: "AI를 잘 쓰는 사람에게 지금 돌아오는 건 뭔가?",
    o: ["\"인정받고 권한이 커졌다\"", "\"일만 더 받고 대우는 같다\"", "\"티 안 내는 게 낫다\"", "아직 그런 사람이 눈에 띄지 않는다", "잘 모르겠다"],
  },
  {
    id: "Q3",
    cat: "남은 사람의 심리",
    t: "AI 때문에 하던 일이 없어지거나 역할이 바뀐 사람이 생기면, 조직은 어떻게 하나?",
    o: [
      "일이나 역할이 조정되었고, 이유와 과정이 설명되었다",
      "조정되었고 설명은 없었지만 별다른 말은 없다",
      "조정되었고 설명이 없어 뒷말이 돈다",
      "아직 없지만 \"다음은 누구냐\"는 말이 들린다",
      "그런 일도 걱정도 아직 없다",
    ],
  },
  {
    id: "Q4",
    cat: "다음 세대의 성장 경로",
    t: "AI 도입 뒤 주니어의 일은 어떻게 달라졌나?",
    o: [
      "\"AI 산출물을 검토하고 책임지는 법을 배우고 있다\"",
      "\"오히려 AI를 제일 잘 써서 팀의 중심이 됐다\"",
      "\"할 일이 애매해졌다\"",
      "\"예전과 다를 게 없다\"",
      "신입이 거의 없어서 해당하지 않는다",
      "잘 모르겠다",
    ],
  },
  {
    id: "Q5",
    cat: "신뢰 장치",
    t: "AI로 만든 자료를 동료나 상사에게 보낼 때 우리 조직의 보통 모습은?",
    o: [
      "썼다고 밝히는 것이 자연스럽다",
      "밝히지 않지만 받는 쪽도 알고 모르는 척한다",
      "썼다고 밝히면 불리하다는 분위기다",
      "썼는지 안 썼는지 아무도 신경 쓰지 않는다",
    ],
  },
  {
    id: "Q6",
    cat: "협업과 소통에서 달라진 장면",
    t: "AI 도입 뒤 협업과 소통에서 달라진 장면은? 가장 눈에 띄는 것을 최대 3개 고르세요.",
    multi: 3,
    exclusive: 6,
    o: [
      "회의를 녹음하고 AI로 요약하는 일이 흔해졌다",
      "동료에게 묻기 전에 AI에게 먼저 묻는다",
      "초안은 AI가 쓰고 사람은 고치는 순서가 기본이 됐다",
      "상사나 동료가 AI로 쓴 티가 나는 메시지를 보낸다",
      "검토하고 수정하는 데 쓰는 시간이 늘었다",
      "요청 속도와 기대치가 올라갔다",
      "달라진 것이 별로 없다",
    ],
  },
  {
    id: "Q8",
    cat: "추이 문항",
    kind: "scale",
    t: "우리 조직은 AI로 인한 일하는 방식의 변화에 잘 대응하고 있다.",
    o: ["전혀 그렇지 않다", "그렇지 않다", "보통이다", "그렇다", "매우 그렇다"],
  },
  {
    id: "Q9",
    cat: "달라진 장면 하나",
    kind: "text",
    t: "AI 도입 뒤 우리 조직에서 가장 달라진 장면 하나를 적어 주세요. (선택 입력)",
    o: [],
  },
];

/** 응답이 필요한 문항. 주관식은 비워도 제출된다 */
export const AX_REQUIRED_ITEMS: readonly AxItem[] = AX_ITEMS.filter((i) => i.kind !== "text");
/** 주관식 최대 글자 수 */
export const AX_TEXT_MAX = 500;

export const AX_ITEM_IDS: readonly string[] = AX_ITEMS.map((i) => i.id);

/** 문항 id를 키로, 단일 선택은 보기 번호, 복수 선택은 보기 번호 배열을 저장한다. */
export type AxAnswer = number | number[] | string;
export type AxAnswers = Record<string, AxAnswer>;

export const isAnswered = (it: AxItem, v: AxAnswer | undefined): boolean =>
  it.kind === "text" ? true : it.multi ? Array.isArray(v) && v.length > 0 : typeof v === "number";

export function validateAxAnswers(input: unknown): AxAnswers | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  const out: AxAnswers = {};
  for (const it of AX_ITEMS) {
    const v = obj[it.id];
    const okIdx = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0 && n < it.o.length;
    if (it.kind === "text") {
      // 선택 입력. 비어 있으면 저장하지 않는다.
      if (v === undefined || v === null || v === "") continue;
      if (typeof v !== "string") return null;
      const t = v.replace(/\s+/g, " ").trim().slice(0, AX_TEXT_MAX);
      if (t) out[it.id] = t;
      continue;
    }
    if (it.multi) {
      if (!Array.isArray(v) || v.length === 0 || v.length > it.multi || !v.every(okIdx)) return null;
      const uniq = [...new Set(v as number[])].sort((a, b) => a - b);
      if (it.exclusive != null && uniq.includes(it.exclusive) && uniq.length > 1) return null;
      out[it.id] = uniq;
    } else {
      if (!okIdx(v)) return null;
      out[it.id] = v;
    }
  }
  return out;
}
