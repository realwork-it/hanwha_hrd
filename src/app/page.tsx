import SurveyApp from "@/components/SurveyApp";
import SiteFooter from "@/components/SiteFooter";

export default function StaffPage() {
  return (
    <>
      <div className="band">
        <div className="inner">
          <p className="eyebrow">REALWORK | 조직개발 준비도 진단 | 조직문화 담당자용</p>
          <h1>조직개발 준비도 진단</h1>
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
        <div className="notice">
          <b>결과는 본인에게 바로 표시되고 3일차 비교 화면에서 같은 계열사 팀장에게 함께 표시됩니다.</b> 솔직하게 답할수록
          제언이 정확해집니다. 제출하면 결과지 링크가 만들어지고, 그 링크로 역장분석 내내 다시 볼 수 있습니다.
        </div>
        <SurveyApp role="staff" />
        <SiteFooter />
      </div>
    </>
  );
}
