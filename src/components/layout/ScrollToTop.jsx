// src/components/layout/ScrollToTop.jsx

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * 이 컴포넌트는 URL 경로(pathname)가 변경될 때마다
 * 윈도우 스크롤을 (0, 0) 위치로 강제 이동시킵니다.
 *
 * App.jsx의 <BrowserRouter> 바로 안쪽에 넣어주면 됩니다.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // pathname이 바뀔 때마다 실행
    window.scrollTo(0, 0);
  }, [pathname]);

  // 이 컴포넌트는 UI를 렌더링하지 않습니다.
  return null;
}