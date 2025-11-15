import React from 'react';
import ReactDOM from 'react-dom/client';
import AlertModal from './components/layout/AlertModal.jsx';

const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL;

// 로그인 필요 알림 모달을 전역에서 한 번만 띄우기 위한 루트 저장 변수
let loginModalRoot = null;

/**
 * 리프레시 토큰까지 만료된 경우, 로그인 필요 AlertModal을 띄우고
 * 확인 클릭 시 로그인 페이지로 이동
 */
function showLoginRequiredModal() {
  // 이미 모달이 떠 있다면 중복으로 생성하지 않음
  if (loginModalRoot) return;

  const container = document.createElement('div');
  document.body.appendChild(container);

  loginModalRoot = ReactDOM.createRoot(container);

  const handleClose = () => {
    if (loginModalRoot) {
      loginModalRoot.unmount();
      loginModalRoot = null;
    }
    document.body.removeChild(container);

    // 로그인 페이지로 네비게이션 (LoginPage.jsx가 매핑된 경로로 이동)
    window.location.href = '/';
  };

  // JSX 대신 React.createElement 사용
  loginModalRoot.render(
    React.createElement(AlertModal, {
      isOpen: true,
      message: '로그인이 필요합니다.',
      onClose: handleClose,
      showCancel: false,
    })
  );
}

/**
 * 401 자동 재발급 로직이 포함된 커스텀 fetch 함수
 * @param {string} url - BASE_URL을 제외한 API 경로 (예: '/user/profile')
 * @param {object} options - fetch에 전달할 옵션 (method, body 등)
 * @returns {Promise<Response>} - fetch의 원본 Response 객체
 */
async function apiFetch(url, options = {}) {
  // 1. (Request Interceptor) 헤더 설정
  const accessToken = localStorage.getItem('accessToken');

  // 기본 헤더 객체
  const defaultHeaders = {};

  if (accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  // body가 FormData의 인스턴스가 *아닐* 경우에만 'Content-Type: application/json'을 추가
  // body가 FormData라면, 브라우저가 자동으로 'multipart/form-data'를 설정하도록 Content-Type을 비워둡니다.
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // 1-2. 옵션 병합 (사용자가 전달한 헤더가 우선)
  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // 2. (Response Interceptor) 401 감지 및 재시도
  // options 객체에 _retry 플래그를 추가하여 무한 재시도를 방지

  // 2-1. 첫 번째 API 호출 시도
  let response = await fetch(`${BASE_URL}${url}`, mergedOptions);

  // 2-2. 401(토큰 만료)이고, 재시도한 적이 없다면?
  if (response.status === 401 && !options._retry) {
    console.log('🔄 Access token 만료. 재발급 시도...');

    // 재시도 플래그 설정
    options._retry = true;

    try {
      // 2-3. 새 토큰 발급 요청 (이것 자체는 apiFetch를 쓰지 않음)
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshResponse.ok) {
        // 리프레시 토큰마저 만료된 경우
        throw new Error('Failed to refresh token');
      }

      const refreshData = await refreshResponse.json();
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = refreshData.data;

      // 2-4. 새 토큰 저장
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      console.log('✅ 토큰 재발급 성공');

      // 2-5. [중요] 실패했던 원래 요청 재시도 (새 토큰으로)
      // options가 아니라 mergedOptions의 헤더를 바꿔야 함
      mergedOptions.headers['Authorization'] = `Bearer ${newAccessToken}`;

      console.log('🔄 원래 요청 재시도...');
      response = await fetch(`${BASE_URL}${url}`, mergedOptions);
    } catch (refreshError) {
      console.error('❌ 토큰 재발급 실패. 강제 로그아웃.', refreshError);
      // 2-6. 재발급 실패 시 강제 로그아웃
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.dispatchEvent(new Event('force-logout')); // TopHeader가 수신

      // 🔔 리프레시 토큰까지 만료된 경우 알림 모달 표시
      showLoginRequiredModal();

      // 실패한 응답(response)을 그대로 반환하거나 에러를 던짐
      return response;
    }
  }

  // 3. 최종 응답 반환 (401이 아니었거나, 재시도 후의 응답)
  return response;
}

// export default로 apiFetch 함수를 내보냅니다.
export default apiFetch;
