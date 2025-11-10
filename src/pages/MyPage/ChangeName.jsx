import { useState } from "react";
import "./ChangeName.css";
import TopHeader from "../../components/layout/TopHeader";

export default function ChangeName() {
  const BACKEND_ON = true; // 실제 백엔드 쓸 때 true 로
  const API_URL = import.meta.env.VITE_APP_BACKEND_URL;

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      alert("새 닉네임을 입력해주세요.");
      return;
    }

    if (!BACKEND_ON) {
      console.log("백엔드 비활성 상태입니다. BACKEND_ON 을 true 로 변경하세요.");
      return;
    }

    if (!API_URL) {
      alert("백엔드 URL이 설정되지 않았습니다. VITE_APP_BACKEND_URL 환경 변수를 확인하세요.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken"); // 프로젝트에 맞게 수정
    if (!accessToken) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/user/profile/name`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 서버에서 에러 형식이 다를 수 있으니 방어적으로 처리
        const msg = data?.message || "닉네임 변경 중 오류가 발생했습니다.";
        throw new Error(msg);
      }

      if (data.success) {
        alert("닉네임이 성공적으로 변경되었습니다!");
        // 필요하다면 여기서 전역 유저 상태 갱신 or 페이지 이동
        // 예: setUser(data.data); 또는 navigate("/my-profile");
      } else {
        alert(data.message || "닉네임 변경에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-name-page">
      <TopHeader />
      <div className="change-name-con">
        <div className="content">
          <div className="header">닉네임 변경</div>
          <form className="name-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="   새 닉네임을 입력해주세요."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "변경 중..." : "확인"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
