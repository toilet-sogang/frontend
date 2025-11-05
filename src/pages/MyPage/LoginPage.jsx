// src/pages/MyPage/LoginPage.jsx (경로 확인)

import './LoginPage.css';
// import { useNavigate } from 'react-router-dom'; // <a> 태그를 사용하므로 useNavigate는 필요 없습니다.

export default function LoginPage() {
    const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL
    // const nav = useNavigate(); // <a> 태그로 대체

    // 백엔드 문서 1-1: 로그인 시작 URL
    // API가 준비되지 않았더라도, 이 URL로 이동하는 것 자체는 에러를 발생시키지 않습니다.
    // (만약 백엔드 서버가 꺼져있다면 브라우저에서 '연결 실패' 페이지만 뜹니다)
    const NAVER_LOGIN_URL = `${BACKEND_URL}/oauth2/authorization/naver`;

    return (
        <div className="container">
            <div className="login-con">
                {/* [수정]
                  API 호출(fetch/axios)이 아닌, <a> 태그를 사용한 페이지 이동으로 변경합니다.
                  사용자가 이 링크를 클릭하면, 우리 백엔드 서버가 네이버 페이지로 리다이렉트시킵니다.
                */}
                <a href={NAVER_LOGIN_URL}>
                    <button className="to-login">
                        네이버 아이디로 로그인하기
                    </button>
                </a>
                {/* <div className="other" onClick={()=>{nav("/signup")}}>회원가입하기</div> */}

            </div>
        </div>
    );
}