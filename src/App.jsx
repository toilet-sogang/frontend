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

function App() {
  return (
    <BrowserRouter >
    <ScrollToTop />
      <Routes>
        
        <Route path="/" element={<HomePage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/changename" element={<ChangeName />} />
        <Route path="/editreview" element={<EditReview />} />
      </Routes>
    
      <Navbar />
    
    </BrowserRouter>
  )
}

export default App
