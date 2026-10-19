import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 응답 저장과 토큰 결과지는 모두 동적 데이터라 캐시 컴포넌트 기능을 쓰지 않는다.
  cacheComponents: false,
};

export default nextConfig;
