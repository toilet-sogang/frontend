
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';



export default function Signup() {
    const nav = useNavigate();

    return<div className="container">
        <div className="login-con">
        <button className="to-login">
            네이버 아이디로 회원가입하기
        </button>
        <div className="other" onClick={()=>{nav("/login")}}>로그인하기</div>

        </div>


    </div>}