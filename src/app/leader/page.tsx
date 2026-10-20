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
            같은 과제도 조직의 준비 상태에 따라 결과가 다릅니다. 파트 1 변화 준비도 15문항에 답하면{" "}
            <b>지금 우리 조직에서 가능한 변화 유형, 접근 전략과 추천 활동</b>까지 결과지로 받습니다. 파트 2는 AX와 일하는
            방식 8문항으로, 결과는 세션에서 함께 봅니다.
          </p>
          <div className="chips">
            <span className="chip">두 파트 23문항, 약 14분</span>
            <span className="chip">평가가 아닙니다</span>
            <span className="chip">담당자 결과와 교차 보기</span>
          </div>
        </div>
      </div>

      <div className="wrap">
        <SurveyApp role="leader" />
        <SiteFooter />
      </div>
    </>
  );
}
