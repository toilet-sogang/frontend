// src/App.jsx

import './App.css'
import Navbar from './components/layout/Navbar'

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import HomePage from './pages/Home/HomePage';
import MyPage from './pages/MyPage/MyPage';
import LoginPage from './pages/MyPage/LoginPage';
import SignupPage from './pages/MyPage/SignupPage';
import ChangeName from './pages/MyPage/ChangeName';
import EditReview from './pages/MyPage/EditReview';
import ScrollToTop from './components/layout/ScrollToTop';
import ToiletDetailPage from './pages/Detail/ToiletDetailPage';
import WriteReviewPage from './pages/Detail/WriteReviewPage';
import AllReviewsPage from './pages/Detail/AllReviewsPage';
import PhotoReviewsPage from './pages/Detail/PhotoReviewsPage';
import PhotoReviewDetailPage from './pages/Detail/PhotoReviewDetailPage';

// [신규] 백엔드 리다이렉션을 처리할 콜백 컴포넌트 임포트
// (경로는 AuthCallback.jsx 파일 위치에 맞게 조정하세요)
import AuthCallback from './pages/AuthCallback'; 

function App() {
  return (
    <BrowserRouter >
    <ScrollToTop />
      <Routes>
        
        {/* --- 기존 라우트 (유지) --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/changename" element={<ChangeName />} />
        <Route path="/editreview" element={<EditReview />} />
        <Route path="/review/:stationId" element={<ToiletDetailPage />} />
        <Route path="/review/:stationId/reviews" element={<AllReviewsPage />} />
        <Route path="/review/:stationId/write" element={<WriteReviewPage />} />
        <Route path="/review/:stationId/photos" element={<PhotoReviewsPage />} />
        <Route path="/review/:stationId/photos/detail" element={<PhotoReviewDetailPage />} />

        {/* [신규] OAuth2 콜백 라우트 추가
          백엔드가 로그인 성공 후 ?accessToken=...&refreshToken=... 를
          붙여서 이 경로로 사용자를 리다이렉트시킵니다.
        */}
        <Route path="/auth/callback" element={<AuthCallback />} />

      </Routes>
    
      <Navbar />
    
    </BrowserRouter>
  )
}

export default App