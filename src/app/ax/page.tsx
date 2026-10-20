import type { Metadata } from "next";
import AxSurvey from "@/components/AxSurvey";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "AX 퀵 서베이 | 조직문화 담당자 워크숍",
  description: "AI 전환이 우리 조직문화에 어디서 걸리는지 일곱 문항으로 함께 확인합니다.",
  robots: { index: false, follow: false },
};

export default function AxPage() {
  return (
    <>
      <div className="band">
        <div className="inner">
          <p className="eyebrow">REALWORK | AX 퀵 서베이 | 조직문화 담당자용</p>
          <h1>AX 시대 조직문화, 우리 회사는 어디에 있나</h1>
          <p className="lede">
            일곱 문항에 답하면 참가 조직 전체의 답이 화면에 모입니다. <b>어느 질문에서 가장 많은 조직이 막혀 있는지</b>를 보고
            토론을 시작합니다.
          </p>
          <div className="chips">
            <span className="chip">7문항, 약 3분</span>
            <span className="chip">점수를 내지 않습니다</span>
            <span className="chip">계열사 이름은 화면에 나오지 않습니다</span>
          </div>
        </div>
      </div>
      <div className="wrap">
        <AxSurvey />
        <SiteFooter />
      </div>
    </>
  );
}
