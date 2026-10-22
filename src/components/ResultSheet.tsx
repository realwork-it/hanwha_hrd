// 결과지 7개 블록. 프로토타입 v0.9 결과지의 구조와 문구를 그대로 옮겼다.
import {
  CONFIG,
  QUADRANT_CELLS,
  SIZES,
  quadrantStrat,
  type QuadrantKey,
} from "@/lib/config";
import { f1, pos, type Scored } from "@/lib/score";

interface Props {
  scored: Scored;
  /** 몇 번 블록까지 보여 줄지. 팀장 결과지는 3번까지만 두고 교차 보기로 넘어간다 */
  upto?: number;
}

const forceNote = (f: string) =>
  f === "mo"
    ? "변화를 원하는 힘"
    : f === "ca"
      ? "변화를 해낼 힘"
      : "원하는 힘과 해낼 힘";

export function Badge({ v }: { v: number }) {
  return v >= CONFIG.CUT ? (
    <span className="badge hi">기준선 위</span>
  ) : (
    <span className="badge lo">기준선 아래</span>
  );
}

export default function ResultSheet({ scored, upto = 6 }: Props) {
  const { axes, mo, ca, quadrant, size, borderMo, borderCa, flagged } = scored;
  const CUT = CONFIG.CUT;
  const qd = CONFIG.quadrants[quadrant];
  const order = SIZES.map((s) => s.key);
  const openUpto = order.indexOf(size);
  const weak = mo < ca ? "변화를 원하는 힘" : "변화를 해낼 힘";
  const bn = [
    borderMo ? "변화를 원하는 힘" : null,
    borderCa ? "변화를 해낼 힘" : null,
  ].filter(Boolean) as string[];
  const cellOrder: QuadrantKey[] = ["hilo", "hihi", "lolo", "lohi"];

  return (
    <>
      <div className="result-band" id="result">
        <div className="rt">결과지</div>
        <div className="rs">제출한 응답으로 자동 생성되었습니다.</div>
      </div>
      <div className="rbody">
        <div className="rblock">
          <h3>
            <span className="bn">0</span>결과를 읽는 틀, 변화 준비도 2요인 모델
          </h3>
          <p className="bs">
            이 결과지는 준비도를 총점 하나로 말하지 않습니다. 성격이 다른 두
            가지, 변화를 원하는 힘과 변화를 해낼 힘으로 나누어 읽습니다.
          </p>
          <div className="model">
            <div className="mcol">
              <div className="mgroup">
                <div className="gl">변화를 원하게 하는 영역</div>
                <div className="gi">A. 경영진 스폰서십</div>
                <div className="gi">B. 변화 필요성 인식</div>
                <div className="gi">C. 구성원 열의</div>
              </div>
              <div className="mgroup">
                <div className="gl">변화를 해내게 하는 영역</div>
                <div className="gi">C. 구성원 피로감</div>
                <div className="gi">D. 변화 이력</div>
                <div className="gi">E. 추진 주체</div>
                <div className="gi">F. 가용 자원</div>
              </div>
            </div>
            <div className="marr" aria-hidden="true">
              →
            </div>
            <div className="mcol">
              <div className="mforce mo">
                <div className="fn">변화를 원하는 힘</div>
                <div className="fd">이것이 약하면 시작이 어렵습니다</div>
              </div>
              <div className="mforce ca">
                <div className="fn">변화를 해낼 힘</div>
                <div className="fd">이것이 약하면 중간에 멈추기 쉽습니다</div>
              </div>
            </div>
            <div className="marr" aria-hidden="true">
              →
            </div>
            <div className="mcol">
              <div className="mout">
                <div className="on">접근 전략</div>
                <div className="od">
                  원하는 힘과 해낼 힘의 조합이 네 가지 접근법 중 하나를
                  가리킵니다
                </div>
              </div>
              {upto >= 4 && (
                <div className="mout">
                  <div className="on">가능한 변화 유형</div>
                  <div className="od">
                    개선형, 개편형, 재설계형 중 지금 감당할 수 있는 범위
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rblock">
          <h3>
            <span className="bn">1</span>여섯 영역 프로파일
          </h3>
          <p className="bs">점선은 기준선 2.75입니다.</p>
          <div className="bars">
            {axes.map((ax) => (
              <div className="brow" key={ax.id}>
                <div className="bl">
                  {ax.id}. {ax.name}
                  <small>{forceNote(ax.force)}</small>
                </div>
                <div className="track">
                  <div
                    className="fill"
                    style={{ width: `${(ax.score / 4) * 100}%` }}
                  />
                  <div
                    className="cutline"
                    style={{ left: `${(CUT / 4) * 100}%` }}
                  />
                </div>
                <div className="bval">{f1(ax.score)}</div>
              </div>
            ))}
          </div>
          <p className="cutnote">
            막대는 4점 만점이고 영역 안 문항들의 평균입니다. 아래의 변화를
            원하는 힘과 해낼 힘은 영역 평균이 아니라 문항 단위로 다시
            계산합니다.
          </p>
        </div>

        <div className="rblock">
          <h3>
            <span className="bn">2</span>변화를 원하는 힘과 해낼 힘의 좌표
          </h3>
          <p className="bs">
            우리 조직이 네 상태 중 어디에 있는지 보여 줍니다.
          </p>
          <div className="coordwrap">
            <div className="coordbox">
              <div className="axlab v">
                <span className="lab">
                  <span className="arr-v">↑ </span>변화를 원하는 힘
                  <span className="arr-h"> →</span>
                </span>
              </div>
              <div className="coord">
                <div className="grid2">
                  {cellOrder.map((k) => (
                    <div
                      className={`cell${k === quadrant ? " on" : ""}`}
                      key={k}
                    >
                      <b>{QUADRANT_CELLS[k].title}</b>
                      {QUADRANT_CELLS[k].sub}
                    </div>
                  ))}
                  <div
                    className="dot"
                    style={{ left: `${pos(ca)}%`, bottom: `${pos(mo)}%` }}
                  />
                </div>
                <div className="axlab">변화를 해낼 힘 →</div>
              </div>
            </div>
            <div className="coordside">
              <div className="scorepair">
                <div className="scorebox">
                  <div className="sl">변화를 원하는 힘</div>
                  <div className="sv">
                    {f1(mo)}
                    <small> /4</small>
                    <Badge v={mo} />
                  </div>
                </div>
                <div className="scorebox">
                  <div className="sl">변화를 해낼 힘</div>
                  <div className="sv">
                    {f1(ca)}
                    <small> /4</small>
                    <Badge v={ca} />
                  </div>
                </div>
              </div>
              {bn.length > 0 && (
                <div className="borderline">
                  {bn.join("과 ")}이 기준선 가까이에 있습니다. 경계 구간에서는
                  이웃한 접근법도 함께 읽고 보수적인 쪽을 고르세요.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rblock">
          <h3>
            <span className="bn">3</span>접근 전략과 추천 활동
          </h3>
          <div className="approach">
            <div className="an">{qd.name}</div>
            <div className="ad">{qd.diag}</div>
            <div className="as">{quadrantStrat(quadrant, size)}</div>
            <div className="fs">추천 활동</div>
            <ol>
              {qd.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        </div>

        {upto >= 4 && (
          <>
            <div className="rblock">
              <h3>
                <span className="bn">4</span>지금 가능한 변화 유형
              </h3>
              <p className="bs">
                변화를 원하는 힘과 해낼 힘의 수준을 바탕으로 지금 시도해 볼 만한
                변화 유형을 보여 줍니다. 색이 칠해진 유형부터 검토해 보세요.
              </p>
              <div className="size3">
                {SIZES.map((s, i) => {
                  // 큰 변화 상태인데 두 힘이 3.25에 못 미쳐 개편형까지만 열린 경우, 재설계형은 "다음 단계"로 표시한다
                  const next =
                    quadrant === "hihi" &&
                    size === "transition" &&
                    s.key === "transform";
                  return (
                    <div
                      className={`seg${i <= openUpto ? " open" : ""}${i === openUpto ? " cap" : ""}${next ? " next" : ""}`}
                      key={s.key}
                    >
                      <span className="captag">여기까지 시도 가능</span>
                      {next && (
                        <span className="nexttag">
                          두 힘이 모두 {CONFIG.SIZE_HI} 이상이면 시도 가능
                        </span>
                      )}
                      <b>{s.name}</b>
                      <small className="def">{s.def}.</small>
                      <small>{s.impact}.</small>
                      <small className="ex">예. {s.ex}</small>
                    </div>
                  );
                })}
              </div>
              <div className="cont" aria-hidden="true">
                <span>부분적</span>
                <div className="cline" />
                <span>전면적</span>
              </div>
              <p className="contnote">
                <span className="dir-h">오른쪽으로</span>
                <span className="dir-v">아래로</span> 갈수록 구성원에게 미치는
                영향이 커지고 변화를 원하는 힘과 해낼 힘이 더 많이 필요합니다.
                큰 유형은 작은 유형에 필요한 활동을 전부 포함합니다.
              </p>
              <p className="sizecap">
                {size === "transform"
                  ? "재설계형까지 검토해 볼 수 있는 상태입니다. 일하는 방식 자체를 다시 설계하는 과제도 시도해 볼 만합니다."
                  : size === "transition"
                    ? "개편형까지 검토해 볼 수 있습니다. 재설계형은 변화를 원하는 힘과 해낼 힘이 더 단단해진 뒤에 고려하시기를 권합니다."
                    : `지금은 개선형부터 시작하시기를 권합니다. ${weak} 쪽이 보강되면 개편형도 검토할 수 있습니다. 범위가 좁다는 것은 하지 말라는 뜻이 아니라 이 유형에서 먼저 성공을 만들자는 뜻입니다.`}
              </p>
            </div>

            <div className="rblock">
              <h3>
                <span className="bn">5</span>낮은 영역에 대한 제언
              </h3>
              <p className="bs">
                점수가 {CONFIG.RX_CUT} 이하인 영역을 낮은 것부터 최대 세 개까지
                보여 줍니다.
                {flagged.length > 0 &&
                  flagged.length < CONFIG.RX_MAX &&
                  ` 이번 응답에서는 ${flagged.length}개 영역이 해당합니다.`}
              </p>
              <div className="rxlist">
                {flagged.length > 0 ? (
                  flagged.map((r) => (
                    <div className="rx" key={r.key}>
                      <div className="rn">
                        {r.name}
                        <span className="sc">{f1(r.score)} /4</span>
                      </div>
                      <div className="rt2">{r.rx}</div>
                    </div>
                  ))
                ) : (
                  <div className="rxnone">
                    {CONFIG.RX_CUT} 이하인 영역이 없습니다. 접근 전략의 추천
                    활동으로 바로 넘어가세요.
                  </div>
                )}
              </div>
            </div>

            <div className="rblock">
              <h3>
                <span className="bn">6</span>이 결과를 쓰는 법
              </h3>
              <div className="honest">
                <b>이 결과지는 변화를 설계하는 출발점입니다.</b>
                응답한 한 사람이 본 조직의 모습을 구조화한 것이라 조직의 실제와
                다를 수 있습니다. 위 여섯 영역 가운데 가장 자신 없는 영역 하나를
                골라 짧은 설문이나 리더 면담으로 확인하는 것까지가 이 진단의
                완성입니다. 결과지는 변화과제 기획서의 배경 자료로 쓰세요.
                과제를 마친 뒤 같은 문항으로 다시 진단하면 변화를 원하는 힘과
                해낼 힘이 어떻게 달라졌는지도 보입니다.
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
