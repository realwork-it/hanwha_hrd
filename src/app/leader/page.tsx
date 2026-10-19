import SurveyApp from "@/components/SurveyApp";
import SiteFooter from "@/components/SiteFooter";

export default function LeaderPage() {
  return (
    <>
      <div className="band">
        <div className="inner">
          <p className="eyebrow">REALWORK | 조직변화 준비도 체크 | 팀장용</p>
          <h1>조직변화 준비도 체크</h1>
          <p className="lede">
            같은 과제도 조직의 준비 상태에 따라 결과가 다릅니다. 15문항에 답하면{" "}
            <b>지금 우리 조직에서 가능한 변화 유형과 접근 전략, 첫걸음</b>까지 결과지로 받습니다.
          </p>
          <div className="chips">
            <span className="chip">15문항, 약 10분</span>
            <span className="chip">평가가 아닙니다</span>
            <span className="chip">담당자 결과와 교차 보기</span>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="notice">
          <b>결과는 본인에게 바로 표시되고, 같은 계열사 조직문화 담당자의 결과와 나란히 놓은 교차 보기가 함께 표시됩니다.</b>{" "}
          두 결과의 차이는 틀린 것이 아니라 서로 다르게 보고 있다는 신호입니다. 솔직하게 답할수록 대화 주제가 또렷해집니다.
        </div>
        <SurveyApp role="leader" />
        <SiteFooter />
      </div>
    </>
  );
}
