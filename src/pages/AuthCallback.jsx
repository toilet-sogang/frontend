// src/pages/AuthCallback.jsx (신규 파일)

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * [신규] OAuth2 로그인 성공 시 백엔드로부터 리다이렉트되는 페이지입니다.
 * URL 쿼리 파라미터에서 토큰을 추출하여 Local Storage에 저장하고,
 * 즉시 메인 페이지로 사용자를 이동시킵니다.
 */
export default function AuthCallback() {
  // 1. URL의 쿼리 파라미터(?accessToken=...)를 읽기 위한 훅
  const [searchParams] = useSearchParams();
  
  // 2. 페이지를 이동시키기 위한 훅
  const navigate = useNavigate();

  useEffect(() => {
    // 3. URL에서 'accessToken'과 'refreshToken'을 꺼냅니다.
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    // 4. 토큰이 둘 다 존재하는지 확인
    if (accessToken && refreshToken) {
      // 5. [핵심] 토큰을 로컬 스토리지에 저장합니다.
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // 6. (디버깅) 성공 로그
      console.log('로그인 성공: AccessToken과 RefreshToken을 로컬 스토리지에 저장했습니다.');

      // 7. 토큰 저장이 끝났으므로 메인 페이지로 이동시킵니다.
      // (replace: true는 브라우저 뒤로가기 시 이 /callback 페이지로 다시 오지 않게 합니다)
      navigate('/homepage', { replace: true });

    } else {
      // 6. (디버깅) 토큰이 URL에 없는 비정상적인 접근
      console.error('인증 실패: URL 쿼리 파라미터에 토큰이 없습니다.');
      alert('로그인에 실패하였습니다. 로그인 페이지로 돌아갑니다.');
      navigate('/', { replace: true });
    }
    
    // 이 로직은 페이지가 처음 렌더링될 때 딱 한 번만 실행되어야 합니다.
  }, [searchParams, navigate]);

  // 토큰 처리 중 사용자에게 잠시 보여줄 임시 화면
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>로그인 처리 중입니다...</h2>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
}