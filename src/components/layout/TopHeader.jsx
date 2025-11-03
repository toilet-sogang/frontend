
import "./TopHeader.css"
import logo from "../../assets/logo.svg"
import { useNavigate } from "react-router-dom";

export default function TopHeader() {

    const navigate = useNavigate();



    return <div className="top-header-con">
        <div className="content">
       <img src={logo} onClick={()=>{navigate("/")}} />
       <div className="log-out">로그아웃</div>
       </div>
    </div>
}