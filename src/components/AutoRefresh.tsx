"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 서버 컴포넌트 화면을 일정 간격으로 다시 받아 온다. 제출 현황을 워크숍 중에 띄워 두기 위한 것.
export default function AutoRefresh({ seconds }: { seconds: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
