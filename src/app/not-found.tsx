import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <div className="band compact">
        <div className="inner">
          <p className="eyebrow">REALWORK x Hanwha | 조직변화 준비도 체크</p>
          <h1>페이지를 찾을 수 없습니다</h1>
        </div>
      </div>
      <div className="wrap" style={{ paddingTop: 24 }}>
        <div className="start">
          <p style={{ margin: "0 0 14px" }}>
            결과지 링크가 잘못 적혔거나 아직 만들어지지 않은 주소입니다. 복사한 링크를 다시 확인해 주세요. 링크를 잃어버렸다면
            진단에 다시 응답하면 새 결과지가 만들어집니다.
          </p>
          <Link href="/" className="btn">
            진단 처음 화면으로
          </Link>
        </div>
        <SiteFooter />
      </div>
    </>
  );
}
