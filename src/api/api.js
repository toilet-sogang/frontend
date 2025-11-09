import axios from 'axios';

// 1. .env 파일에서 백엔드 URL을 읽어옵니다.
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:8080';

// 2. Axios 기본 인스턴스 생성
//    - 앞으로 모든 API 요청은 이 'api' 인스턴스를 통해 실행됩니다.
const api = axios.create({
    baseURL: BACKEND_URL,
});

// 3. [요청 인터셉터] (Request Interceptor)
//    - 모든 API 요청이 서버로 전송되기 "전"에 실행됩니다.
//    - 로컬 스토리지에서 accessToken을 꺼내 'Authorization' 헤더에 담아줍니다.
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 4. [응답 인터셉터] (Response Interceptor)
//    - API 요청이 서버로부터 응답을 받은 "후"에 실행됩니다.
api.interceptors.response.use(
    (response) => {
        // [4-A] 2xx 범위의 성공적인 응답은 그대로 반환
        return response;
    },
    async (error) => {
        // [4-B] 2xx 범위를 벗어난 에러 응답 처리
        const originalRequest = error.config;

        // 401 (Unauthorized) 에러이고, 아직 재시도하지 않은 요청일 경우
        // (originalRequest._retry 플래그로 무한 재시도 방지)
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            originalRequest._retry = true; // "재시도 했음" 플래그 설정
            console.log("Access Token 만료. 토큰 재발급을 시도합니다.");

            const refreshToken = localStorage.getItem('refreshToken');

            // 리프레시 토큰이 없으면 로그인 페이지로 보냄
            if (!refreshToken) {
                console.error("Refresh token이 없습니다. 로그인이 필요합니다.");
                localStorage.removeItem('accessToken'); // 확실하게 삭제
                window.location.href = '/login'; // navigate 훅을 쓸 수 없으므로 window.location 사용
                return Promise.reject(error);
            }

            try {
                // [5] 토큰 재발급 API 호출 (백엔드 샘플의 reissueToken 함수 참고)
                // (중요) 이 API 호출은 'api' 인스턴스가 아닌 'axios' 원본을 사용해야
                //      요청 인터셉터가 다시 실행되는 무한 루프를 방지할 수 있습니다.
                const refreshResponse = await axios.post(`${BACKEND_URL}/auth/refresh`, {
                    refreshToken: refreshToken 
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });

                // [6] 재발급 성공
                // (백엔드 샘플의 응답 형식 'result.data.accessToken' 참고)
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

                // 새 토큰을 로컬 스토리지에 저장
                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                console.log("토큰 재발급 성공. 새 토큰을 저장합니다.");

                // [7] 실패했던 원래 요청(originalRequest)의 헤더를 새 토큰으로 교체
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // [8] 실패했던 원래 요청을 "다시" 실행
                return api(originalRequest);

            } catch (refreshError) {
                // [9] 토큰 재발급 실패 (Refresh Token 만료 등)
                console.error("토큰 재발급 실패:", refreshError);
                
                // (중요) 강제로 로그아웃 처리 및 로그인 페이지로 이동
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                
                return Promise.reject(refreshError);
            }
        }
        
        // 401 에러가 아니거나 이미 재시도한 경우는 그냥 에러를 반환
        return Promise.reject(error);
    }
);

export default api;