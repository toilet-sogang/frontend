// 예: src/components/layout/AlertModal.jsx

import React from "react";
import "./AlertModal.css"; // CSS 파일을 임포트합니다.

export default function AlertModal({ isOpen, message, onClose }) {
  // isOpen이 false이면 아무것도 렌더링하지 않습니다.
  if (!isOpen) {
    return null;
  }

  return (
    // 모달 배경 (뒷화면 어둡게)
    <div className="modal-backdrop">
      {/* 모달 팝업창 본체 */}
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <button className="modal-button" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}