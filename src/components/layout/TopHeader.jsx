import "./TopHeader.css"
import logo from "../../assets/logo.svg"
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react"; 
import AlertModal from "../../components/layout/AlertModal";
import axios from 'axios'; // [신규] 수동 재발급을 위해 raw axios 임포트

export default function TopHeader() {

    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalCloseAction, setModalCloseAction] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []); 

    // [수정] 모달 열기/닫기 로직 (재사용 가능하도록)
    const showModal = (message, action = null) => {
        setModalMessage(message);
        setModalCloseAction(() => action); // 닫기 버튼 후 실행할 함수 설정
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalMessage("");
        if (typeof modalCloseAction === 'function') {
            modalCloseAction(); // 설정된 액션 실행
        }
        setModalCloseAction(null); // 액션 초기화
    };

    // [기존] 로그아웃 핸들러 (수정 없음, api.js가 자동 처리)
    const handleLogout = async () => {
        // ... (이전과 동일한 로그아웃 로직) ...
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            showModal('이미 로그아웃 상태입니다.');
            return;
        }

        const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:8080';
        const API_URL = `${BACKEND_URL}/auth/logout`;

        let messageToShow = '';

        try {
            // api.js의 'api' 인스턴스를 사용하면 자동 토큰 재발급이 시도될 수 있으나,
            // 로그아웃은 보통 만료 토큰으로도 가능해야 합니다.
            // 여기서는 raw fetch 또는 axios를 쓰는 것이 나을 수 있지만,
            // 일단은 api.js를 사용하도록 두겠습니다. (이전 단계에서 api.js로 수정했으므로)
            
            // fetch로 수정 (api.js 임포트가 없었으므로)
            await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });
            
            messageToShow = '로그아웃되었습니다.';

        } catch (err) {
            console.error('로그아웃 API 통신 실패:', err);
            messageToShow = '로그아웃 API 통신에 실패했습니다. 로컬 토큰을 강제로 삭제합니다.';
        
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsLoggedIn(false); 
            
            // 모달을 띄우고, "확인" 누르면 홈으로 이동
            showModal(messageToShow, () => navigate('/'));
        }
    };

    // [신규] 수동 토큰 재발급 핸들러
    const handleManualRefresh = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            showModal("Refresh Token이 없습니다. (로그인 필요)");
            return;
        }

        const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:8080';
        const API_URL = `${BACKEND_URL}/auth/refresh`;

        try {
            // (중요) 자동 재발급(인터셉터)과의 무한 루프를 피하기 위해
            // 'api' 인스턴스가 아닌 'axios' 원본으로 직접 호출합니다.
            const response = await axios.post(API_URL, 
                { refreshToken }, // body
                { headers: { 'Content-Type': 'application/json' } }
            );

            // 백엔드 샘플의 응답 형식 참고
            if (response.data && response.data.success) {
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                
                // 새 토큰 저장
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                
                showModal('🔄 토큰 재발급 성공! 새 토큰이 저장되었습니다.');
                
            } else {
                // API는 성공(200 OK)했으나, 백엔드가 거부 (success: false)
                showModal(`❌ 재발급 실패: ${response.data.message || '알 수 없는 오류'}`);
            }

        } catch (err) {
            console.error("수동 토큰 재발급 실패:", err);
            
            // API 실패 (401: Refresh Token 만료 등)
            if (err.response && err.response.status === 401) {
                // Refresh token이 만료되었으므로 강제 로그아웃
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setIsLoggedIn(false); // UI 업데이트
                showModal("❌ 재발급 실패: Refresh Token이 만료되었습니다. 강제 로그아웃됩니다.", () => navigate('/login'));
            } else {
                showModal(`❌ 재발급 중 네트워크 오류 발생: ${err.message}`);
            }
        }
    };


    return (
        <>
            <div className="top-header-con">
                <div className="content">
                    <img src={logo} onClick={()=>{navigate("/")}} />
                    
                    {/* [수정] 로그인 시 버튼 2개가 보이도록 그룹화 */}
                    {isLoggedIn && (
                        <div className="header-actions">
                            {/* [신규] 수동 재발급 버튼 */}
                            <button 
                                type="button" 
                                className="header-btn refresh-btn" 
                                onClick={handleManualRefresh}
                                title="수동 토큰 재발급"
                            >
                                🔄
                            </button>

                            {/* [기존] 로그아웃 버튼 */}
                            <div className="log-out" onClick={handleLogout}>로그아웃</div>
                        </div>
                    )}
                </div>
            </div>

            {/* [기존] 모달 컴포넌트 */}
            <AlertModal 
                isOpen={isModalOpen}
                message={modalMessage}
                onClose={closeModal}
            />
        </>
    );
}