import SurveyApp from "@/components/SurveyApp";
import SiteFooter from "@/components/SiteFooter";

export default function StaffPage() {
  return (
    <>
      <div className="band">
        <div className="inner">
          <p className="eyebrow">REALWORK | 조직변화 준비도 체크 | 조직문화 담당자용</p>
          <h1>조직변화 준비도 체크</h1>
          <p className="lede">
            같은 과제도 조직의 준비 상태에 따라 결과가 다릅니다. 15문항에 답하면{" "}
            <b>지금 우리 조직에서 가능한 변화 유형과 접근 전략, 첫걸음</b>까지 결과지로 받습니다.
          </p>
          <div className="chips">
            <span className="chip">15문항, 약 10분</span>
            <span className="chip">평가가 아닙니다</span>
            <span className="chip">결과는 접근법과 첫걸음까지</span>
          </div>
        </div>
      </div>

      <div className="wrap">
        <SurveyApp role="staff" />
        <SiteFooter />
      </div>
    </>
  );
}
