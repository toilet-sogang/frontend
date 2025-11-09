// src/components/layout/AlertModal.jsx

import React from "react";
import "./AlertModal.css";

export default function AlertModal({
  isOpen,
  message,
  onClose,          // 확인 버튼 클릭
  showCancel = false, // 기본값: false → 확인 버튼만
  onCancel,         // 취소 버튼 클릭 (옵션)
}) {
  if (!isOpen) return null;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p className="modal-message">{message}</p>

        <div className="modal-buttons">
          {showCancel && (
            <button className="modal-button cancel" onClick={handleCancel}>
              취소
            </button>
          )}
          <button className="modal-button" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
