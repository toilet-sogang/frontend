import { useState } from 'react';
import home from '../../assets/Navbar/home.svg';
import my from '../../assets/Navbar/my.svg';
import my_active from '../../assets/Navbar/my_active.svg';
import home_active from '../../assets/Navbar/home_active.svg';

import './Navbar.css';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate(); 
    const [activeTab, setActiveTab] = useState("home"); // "home" 또는 "my"

    const handleClick = (tab, path) => {
        setActiveTab(tab);  // 클릭한 탭 활성화
        navigate(path);     // 페이지 이동
    };

    return (
        <div className="navbar">
            <div className="nav-con">
                <div className="icons">
                    <img 
                        src={activeTab === "home" ? home_active : home} 
                        alt="home" 
                        onClick={() => handleClick("home", "/")} 
                    />
                    <img 
                        src={activeTab === "my" ? my_active : my} 
                        alt="my"  
                        onClick={() => handleClick("my", "/mypage")} 
                    />
                </div>
            </div>
        </div>
    );
}
