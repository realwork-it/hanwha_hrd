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
}

export const AX_INTRO = "회사 전체 또는 당신이 가장 잘 아는 조직(본부나 사업부)을 떠올려 답하세요.";

export const AX_ITEMS: readonly AxItem[] = [
  {
    id: "Q0",
    cat: "AI 활용이 퍼진 모습",
    t: "우리 조직에서 지금 AI 활용은 어떤 모습에 가장 가깝나?",
    o: [
      "회사가 도구와 규칙을 정해 주고 대부분이 쓴다",
      "팀이나 부서 단위로 알아서 쓰고 서로 공유한다",
      "잘 쓰는 개인 몇몇이 쓰고 주변에 알려 준다",
      "각자 조용히 쓰고 말은 잘 하지 않는다",
      "아직 거의 쓰지 않는다",
    ],
  },
  {
    id: "Q1",
    cat: "줄어든 시간의 행방",
    t: "AI로 줄어든 시간에 대해 가장 자주 들리는 말은?",
    o: [
      "\"덕분에 더 중요한 일을 한다\"",
      "\"그만큼 일이 더 들어온다\"",
      "\"빨라진 걸 굳이 말하지 않는다\"",
      "아직 시간이 줄었다는 말 자체가 없다",
      "잘 모르겠다",
    ],
  },
  {
    id: "Q2",
    cat: "AI를 잘 쓰는 사람의 대우",
    t: "AI를 잘 쓰는 사람에 대해 가장 자주 들리는 말은?",
    o: ["\"인정받고 역할이 커졌다\"", "\"일만 더 받는다\"", "\"티 안 내는 게 낫다\"", "아직 그런 사람이 눈에 띄지 않는다", "잘 모르겠다"],
  },
  {
    id: "Q3",
    cat: "역할이 바뀐 사람에 대한 반응",
    t: "AI 때문에 일이 줄거나 역할이 바뀐 사람이 생겼을 때, 조직의 반응은?",
    o: [
      "새 역할로 옮기는 과정이 설명되었다",
      "처리는 됐는데 설명은 없었다",
      "조용히 처리되었고 뒷말이 돈다",
      "아직 없지만 \"다음은 누구냐\"는 말이 들린다",
      "그런 일도 걱정도 아직 없다",
    ],
  },
  {
    id: "Q4",
    cat: "주니어의 지금",
    t: "주니어에 대해 가장 자주 들리는 말은?",
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
    cat: "AI 산출물을 주고받는 방식",
    t: "AI로 만든 자료를 동료나 상사에게 보낼 때 우리 조직의 보통 모습은?",
    o: [
      "썼다고 밝히는 것이 자연스럽다",
      "밝히지 않지만 받는 쪽도 알고 모르는 척한다",
      "받는 쪽이 다시 검토하느라 일이 늘었다는 불만이 있다",
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
    id: "Q7",
    cat: "담당자인 내가 올해 먼저 손댈 것",
    t: "AX와 관련해 조직문화 담당자인 내가 올해 먼저 손댈 것 하나를 고른다면?",
    o: [
      "AI 산출물을 보낼 때 밝히고 확인하는 규범 만들기",
      "리더가 AI로 소통할 때의 기준 정하기",
      "역할이 바뀌는 사람에게 설명하는 방식 설계하기",
      "주니어가 배우는 경로 다시 만들기",
      "구성원이 체감하는 것을 측정해 경영진에 올리기",
      "아직 조직문화 담당자의 일이라고 보지 않는다",
      "아직 모르겠다, 오늘 토론에서 정하고 싶다",
    ],
  },
];

export const AX_ITEM_IDS: readonly string[] = AX_ITEMS.map((i) => i.id);

/** 문항 id를 키로, 단일 선택은 보기 번호, 복수 선택은 보기 번호 배열을 저장한다. */
export type AxAnswer = number | number[];
export type AxAnswers = Record<string, AxAnswer>;

export const isAnswered = (it: AxItem, v: AxAnswer | undefined): boolean =>
  it.multi ? Array.isArray(v) && v.length > 0 : typeof v === "number";

export function validateAxAnswers(input: unknown): AxAnswers | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  const out: AxAnswers = {};
  for (const it of AX_ITEMS) {
    const v = obj[it.id];
    const okIdx = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0 && n < it.o.length;
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
