import './App.css'
import Navbar from './components/layout/Navbar'

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import HomePage from './pages/Home/HomePage';
import MyPage from './pages/MyPage/MyPage';
import LoginPage from './pages/MyPage/LoginPage';
import SignUpPage from './pages/MyPage/SignUpPage';


function App() {
  return (
    <BrowserRouter >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    
      <Navbar />
    
    </BrowserRouter>
  )
}

export default App
