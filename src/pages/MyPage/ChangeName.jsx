
import "./ChangeName.css"
import TopHeader from "../../components/layout/TopHeader"

export default function ChangeName() {


    return <div className="change-name-page">
    <TopHeader />
    <div className="change-name-con">
    <div className="content">
    <div className="header">닉네임 변경</div>
    <form className="name-form">
        <input type="text" placeholder="&nbsp;&nbsp;&nbsp;새 닉네임을 입력해주세요."/>
        <button type="submit">확인</button>
    </form>
    </div>
    </div>
    </div>
    
    

}