// 산출 로직. 프로토타입 render() 안의 계산을 순수 함수로 옮겼다.
import { CONFIG, ITEM_IDS, type QuadrantKey, type SizeKey, type Force } from "./config";

export type Answers = Record<string, number>;

export interface AxisScore {
  id: string;
  name: string;
  force: Force;
  score: number;
}

export interface RxResult {
  key: string;
  name: string;
  score: number;
  rx: string;
}

export interface Scored {
  axes: AxisScore[];
  mo: number;
  ca: number;
  hiMo: boolean;
  hiCa: boolean;
  quadrant: QuadrantKey;
  size: SizeKey;
  borderMo: boolean;
  borderCa: boolean;
  flagged: RxResult[];
}

export const mean = (ids: readonly string[], answers: Answers): number =>
  ids.reduce((s, k) => s + answers[k], 0) / ids.length;

/** 소수 둘째 자리 문자열 (프로토타입 f1) */
export const f1 = (n: number): string => (Math.round(n * 100) / 100).toFixed(2);

/** 좌표 점 위치. 셀 경계(50%)가 기준선과 일치하도록 구간별로 계산한다. */
export const pos = (v: number): number => {
  const CUT = CONFIG.CUT;
  const p = v <= CUT ? ((v - 1) / (CUT - 1)) * 50 : 50 + ((v - CUT) / (4 - CUT)) * 50;
  return Math.min(97, Math.max(3, p));
};

export function score(answers: Answers): Scored {
  const CUT = CONFIG.CUT;
  const mo = mean(CONFIG.moItems, answers);
  const ca = mean(CONFIG.caItems, answers);
  const hiMo = mo >= CUT;
  const hiCa = ca >= CUT;
  const quadrant = ((hiMo ? "hi" : "lo") + (hiCa ? "hi" : "lo")) as QuadrantKey;
  const size: SizeKey =
    mo >= CONFIG.SIZE_HI && ca >= CONFIG.SIZE_HI ? "transform" : hiMo && hiCa ? "transition" : "develop";
  const axes = CONFIG.axes.map((ax) => ({
    id: ax.id,
    name: ax.resultName ?? ax.name,
    force: ax.force,
    score: mean(ax.items.map((i) => i.id), answers),
  }));
  const flagged = CONFIG.rxAxes
    .map((r) => ({ key: r.key, name: r.name, rx: r.rx, score: mean(r.calc, answers) }))
    .filter((r) => r.score <= CONFIG.RX_CUT)
    .sort((a, b) => a.score - b.score)
    .slice(0, CONFIG.RX_MAX);
  return {
    axes,
    mo,
    ca,
    hiMo,
    hiCa,
    quadrant,
    size,
    borderMo: Math.abs(mo - CUT) <= CONFIG.BORDER,
    borderCa: Math.abs(ca - CUT) <= CONFIG.BORDER,
    flagged,
  };
}

/** 저장 전 검증. 15문항 모두 1~4 정수여야 한다. */
export function validateAnswers(input: unknown): Answers | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  const out: Answers = {};
  for (const id of ITEM_IDS) {
    const v = obj[id];
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 4) return null;
    out[id] = v;
  }
  return out;
}
