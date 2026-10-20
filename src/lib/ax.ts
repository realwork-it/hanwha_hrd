// AX 퀵 서베이. 점수를 내지 않고 보기별 응답 수만 집계한다.
// 문항은 토론 자료 "AX 시대 조직문화를 묻는 여섯 개의 질문"의 여섯 범주와 시작 질문을 옮겼다.

export interface AxItem {
  id: string;
  cat: string;
  t: string;
  o: readonly string[];
}

export const AX_ITEMS: readonly AxItem[] = [
  {
    id: "Q0",
    cat: "시작 질문",
    t: "우리 회사에서 AI는 지금 누구의 문제로 다뤄지고 있나?",
    o: ["경영진의 문제", "HR이나 조직문화 담당자의 문제", "각자 알아서 할 문제", "아직 아무도 다루지 않는다"],
  },
  {
    id: "Q1",
    cat: "분배의 공정성",
    t: "AI로 생긴 이익과 시간이 누구에게 가는지, 우리 회사는 직원에게 말하고 있나?",
    o: ["원칙이 있고 직원도 안다", "원칙은 있는데 직원은 모른다", "원칙이 없다", "모르겠다"],
  },
  {
    id: "Q2",
    cat: "제도의 시차",
    t: "AI 도입 뒤에 평가나 직무 설계 가운데 손본 것이 있나?",
    o: ["평가와 직무 설계 둘 다 손봤다", "하나는 손봤다", "논의 중이다", "없다"],
  },
  {
    id: "Q3",
    cat: "남은 사람의 심리",
    t: "AI로 역할이 줄어든 직원이 어떻게 처리됐는지, 구성원이 기억하는 이야기에 가장 가까운 것은?",
    o: ["설명과 역할 전환이 있었다고 기억한다", "조용히 사라졌다고 기억한다", "아직 그런 사례가 없다", "모르겠다"],
  },
  {
    id: "Q4",
    cat: "다음 세대의 성장 경로",
    t: "신입이나 주니어가 하던 일 가운데 AI가 대신하게 된 것이 있나?",
    o: ["있고, 대신 배울 경로도 만들었다", "있는데, 배울 경로는 없다", "아직 없다", "모르겠다"],
  },
  {
    id: "Q5",
    cat: "신뢰 장치",
    t: "AI로 만든 산출물을 보낼 때 무엇을 확인하고 책임지는지 정한 규범이 있나?",
    o: ["전사 규범이 있다", "팀마다 다르다", "없다", "모르겠다"],
  },
  {
    id: "Q6",
    cat: "역할과 통제감",
    t: "AI 도입 뒤 직원이 직접 결정하는 범위는 어떻게 달라졌나?",
    o: ["늘었다", "그대로다", "줄었다", "모르겠다"],
  },
];

export const AX_ITEM_IDS: readonly string[] = AX_ITEMS.map((i) => i.id);

/** 문항 id를 키로, 고른 보기의 번호(0~3)를 값으로 저장한다. */
export type AxAnswers = Record<string, number>;

export function validateAxAnswers(input: unknown): AxAnswers | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  const out: AxAnswers = {};
  for (const it of AX_ITEMS) {
    const v = obj[it.id];
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v >= it.o.length) return null;
    out[it.id] = v;
  }
  return out;
}
