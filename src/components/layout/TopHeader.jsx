import "./TopHeader.css"
import logo from "../../assets/logo.svg"
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react"; 
import AlertModal from "../../components/layout/AlertModal";
// 📍 api.js 파일에서 apiFetch 함수를 export default로 내보냈다고 가정합니다.
import apiFetch from '../../api.js'; 

export default function TopHeader() {



    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalCloseAction, setModalCloseAction] = useState(null);

    // [수정] 컴포넌트 마운트 시, 토큰 존재 여부로 로그인 상태 초기화
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []); 

    // [신규] ⭐️ 인터셉터로부터의 강제 로그아웃 이벤트를 수신
    useEffect(() => {
        const handleForceLogout = () => {
            setIsLoggedIn(false); // UI 업데이트
            // 모달을 띄워 사용자에게 알림
            showModal("세션이 만료되었습니다. 다시 로그인해주세요.", () => navigate('/'));
        };

        window.addEventListener('force-logout', handleForceLogout);

        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
            window.removeEventListener('force-logout', handleForceLogout);
        };
    }, [navigate]);

    // [수정] 모달 열기/닫기 로직 (재사용 가능하도록)
    const showModal = (message, action = null) => {
        setModalMessage(message);
        setModalCloseAction(() => action);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalMessage("");
        if (typeof modalCloseAction === 'function') {
            modalCloseAction();
        }
        setModalCloseAction(null);
    };

    // 🔽 [수정] 로그아웃 핸들러 (apiFetch 방식)
    const handleLogout = async () => {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            showModal('이미 로그아웃 상태입니다.');
            return;
        }

        let messageToShow = '';

        try {
            // 1. apiFetch 호출 시 'method' 등 옵션 전달
            const response = await apiFetch('/auth/logout', {
                method: 'POST'
            });
            
            // 2. [필수] 'fetch' 기반이므로 'response.ok'를 수동으로 체크
            if (!response.ok) {
                // 401(만료 토큰)으로 로그아웃해도 성공(2xx)할 수 있지만,
                // 만약 서버가 4xx, 5xx를 반환한다면 여기서 잡습니다.
                console.error('로그아웃 API 응답 오류', response.status);
                // (하지만 response.ok가 false여도 로그아웃은 강행합니다)
            }
            
            messageToShow = '로그아웃되었습니다.';

        } catch (err) {
            // 3. 이 catch는 'fetch' 자체의 네트워크 실패(예: 서버 다운)만 잡습니다.
            console.error('로그아웃 API 통신 실패 (네트워크 오류):', err);
            messageToShow = '로그아웃 API 통신에 실패했습니다. 로컬 토큰을 강제로 삭제합니다.';
        
        } finally {
            // ⭐️ API 성공/실패 여부와 관계없이 로컬 스토리지를 비웁니다.
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsLoggedIn(false); // UI 업데이트
            
            // 모달을 띄우고, "확인" 누르면 홈으로 이동
            showModal(messageToShow, () => navigate('/'));
        }
    };

    return (
        <>
            <div className="top-header-con">
                <div className="content">
                    <img src={logo} onClick={()=>{navigate("/")}} />
                    
                    {isLoggedIn && (
                        <div className="header-actions">
                            <div className="log-out" onClick={()=>{handleLogout(); navigate('/')}}>로그아웃</div>
                        </div>
                    )}
                </div>
            </div>

            <AlertModal 
                show={isModalOpen} // (props 이름이 'isOpen'이라면 'isOpen={isModalOpen}'으로 수정)
                message={modalMessage}
                onClose={closeModal}
            />
        </>
    );
}