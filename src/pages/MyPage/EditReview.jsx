import React, { useId, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopHeader from "../../components/layout/TopHeader";
import star_yell from "../../assets/star/star-yell.svg";
import star_grey from "../../assets/star/star-grey.svg";
import "./EditReview.css";
import ad from "../../assets/MyPage/ad_edit.svg";
import AlertModal from "../../components/layout/AlertModal";

// ⭐ 백엔드 설정
const API_URL = import.meta.env.VITE_APP_BACKEND_URL;
const BACKEND_ON = false; // 실제 서버 붙일 땐 true 로!

// 별점 렌더링 함수
const renderStars = (star, onChange, size = 40) => {
  return (
    <div className="star-container er-stars" role="radiogroup" aria-label="별점 선택">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = star >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={star === n}
            className={`er-star ${active ? "is-active" : ""}`}
            onClick={() => onChange?.(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                onChange?.(Math.min(5, (star || 0) + 1));
              }
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                onChange?.(Math.max(1, (star || 0) - 1));
              }
            }}
          >
            <img
              src={active ? star_yell : star_grey}
              alt={active ? `${n}점 선택됨` : `${n}점 선택`}
              className="star-icon"
              style={{ width: `${size}px`, height: `${size}px` }}
            />
          </button>
        );
      })}
    </div>
  );
};

/** 백엔드 enum -> 라벨 매핑 */
const tagMap = {
  TOILET_CLEAN: "변기 상태가 청결해요",
  SINK_CLEAN: "세면대가 청결해요",
  GOOD_VENTILATION: "환기가 잘 돼요",
  ENOUGH_HANDSOAP: "손 세정제가 충분해요",
  BRIGHT_LIGHTING: "조명 밝아요",
  TRASH_OVERFLOW: "쓰레기가 넘쳐요",
  DIRTY_FLOOR: "바닥이 더러워요",
  DIRTY_MIRROR: "거울이 지저분해요",
  NO_TOILET_PAPER: "휴지가 없어요",
  BAD_ODOR: "악취가 심해요",
};

const TAG_KEYS = Object.keys(tagMap);
const POSITIVE_TAG_KEYS = TAG_KEYS.slice(0, 5);
const NEGATIVE_TAG_KEYS = TAG_KEYS.slice(5);

export default function EditReview() {
  const location = useLocation();
  const nav = useNavigate();

  const initialReview = location.state?.review;

  // 🔹 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalCloseAction, setModalCloseAction] = useState(null);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalMessage("");
    if (typeof modalCloseAction === "function") {
      modalCloseAction();
    }
    setModalCloseAction(null);
  };

  useEffect(() => {
    if (!initialReview) {
      setModalMessage("잘못된 접근입니다. 리뷰 정보가 없습니다.");
      setModalCloseAction(() => () => nav("/mypage"));
      setIsModalOpen(true);
    }
  }, [initialReview, nav]);

  const [star, setStar] = useState(
    typeof initialReview?.star === "number" ? initialReview.star : 0
  );
  const [desc, setDesc] = useState(initialReview?.desc ?? "");
  const [isDisability, setIsDisability] = useState(
    Boolean(initialReview?.is_disability ?? false)
  );
  const [selectedTags, setSelectedTags] = useState(
    new Set(
      Array.isArray(initialReview?.tag)
        ? initialReview.tag.filter((k) => tagMap[k])
        : []
    )
  );

  const [existingPhotos, setExistingPhotos] = useState(
    initialReview?.photo ?? []
  );
  const [newPhotos, setNewPhotos] = useState([]);
  const [deletedPhotos, setDeletedPhotos] = useState([]);

  const fileInputRef = useRef(null);
  const MAX_PHOTOS = 2;

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const uid = useId();
  const MAX_DESC = 1000;

  const toggleTag = (key) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        return next;
      } else {
        if (prev.size < 3) {
          next.add(key);
          return next;
        } else {
          setModalMessage("최대 3개까지 선택 가능합니다.");
          setIsModalOpen(true);
          return prev;
        }
      }
    });
  };

  const validate = () => {
    const next = {};
    if (!star || star < 1) next.star = "별점을 선택하세요.";
    if (!desc.trim()) next.desc = "리뷰를 작성해주세요.";
    if (desc.length > MAX_DESC)
      next.desc = `설명은 ${MAX_DESC}자 이내로 입력하세요.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /** 파일 업로드 버튼 */
  const handlePhotoUploadClick = () => {
    if (existingPhotos.length + newPhotos.length >= MAX_PHOTOS) {
      setModalMessage(`사진은 최대 ${MAX_PHOTOS}장까지 업로드할 수 있습니다.`);
      setIsModalOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  /** 파일 선택 시 */
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const currentTotal = existingPhotos.length + newPhotos.length;
    const remainingSlots = MAX_PHOTOS - currentTotal;

    if (files.length > remainingSlots) {
      setModalMessage(`최대 ${MAX_PHOTOS}장까지 업로드 가능합니다.`);
      setIsModalOpen(true);
    }

    const filesToAdd = files.slice(0, remainingSlots).map((file) => ({
      file: file,
      preview: URL.createObjectURL(file),
    }));

    setNewPhotos((prev) => [...prev, ...filesToAdd]);

    if (event.target) {
      event.target.value = null;
    }
  };

  /** 기존 사진 삭제 */
  const handleDeleteExisting = (idToDelete) => {
    setExistingPhotos((prev) =>
      prev.filter((photo) => photo.id !== idToDelete)
    );
    setDeletedPhotos((prev) => [...prev, idToDelete]);
  };

  /** 새로 추가한 사진 삭제 */
  const handleDeleteNew = (indexToRemove) => {
    setNewPhotos((prev) => {
      const newArray = [...prev];
      const [removedPhoto] = newArray.splice(indexToRemove, 1);
      if (removedPhoto) {
        URL.revokeObjectURL(removedPhoto.preview);
      }
      return newArray;
    });
  };

  /** 언마운트 시 미리보기 URL 해제 */
  useEffect(() => {
    return () => {
      newPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, [newPhotos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !initialReview) return;

    // 🔹 백엔드 OFF: 기존처럼 mock 처리
    if (!BACKEND_ON) {
      try {
        setSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setModalMessage("리뷰가 수정되었습니다. (mock 모드)");
        setModalCloseAction(() => () => nav(-1));
        setIsModalOpen(true);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // 🔹 백엔드 ON: 실제 API 호출
    if (!API_URL) {
      setModalMessage("백엔드 URL이 설정되지 않았습니다.");
      setIsModalOpen(true);
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setModalMessage("로그인 정보가 없습니다. 다시 로그인해주세요.");
      setIsModalOpen(true);
      return;
    }

    setSubmitting(true);

    try {
      // 1) 리뷰 내용 수정 PATCH /user/review/{reviewId}
      const reviewPayload = {
        star: Number(star),
        desc: desc.trim(),
        tags: Array.from(selectedTags),
        is_disability: Boolean(isDisability),
      };

      const reviewRes = await fetch(
        `${API_URL}/user/review/${initialReview.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(reviewPayload),
        }
      );

      const reviewData = await reviewRes.json().catch(() => ({}));
      if (!reviewRes.ok || reviewData?.success === false) {
        throw new Error(
          reviewData?.message || "리뷰 수정 중 오류가 발생했습니다."
        );
      }

      // 2) 이미지 수정 PATCH /user/review/{reviewId}/photos
      if (newPhotos.length > 0 || deletedPhotos.length > 0) {
        const formData = new FormData();

        // 추가되는 이미지
        newPhotos.forEach((photo) => {
          formData.append("photos", photo.file, photo.file.name);
        });

        // 삭제할 이미지 id 목록
        const requestBody = {
          deleteImageIds: deletedPhotos,
        };
        formData.append("request", JSON.stringify(requestBody));

        const photosRes = await fetch(
          `${API_URL}/user/review/${initialReview.id}/photos`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              // ⚠️ 'Content-Type' 은 브라우저가 boundary 포함해서 자동 세팅하도록 둠
            },
            body: formData,
          }
        );

        const photosData = await photosRes.json().catch(() => ({}));
        if (!photosRes.ok || photosData?.success === false) {
          throw new Error(
            photosData?.message ||
              "리뷰 이미지 수정 중 오류가 발생했습니다."
          );
        }

        // 필요하다면 응답으로 existingPhotos 갱신 가능 (지금은 바로 뒤로 가므로 생략)
        // setExistingPhotos(photosData.data ?? []);
      }

      setModalMessage("리뷰가 수정되었습니다.");
      setModalCloseAction(() => () => nav(-1));
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setModalMessage(`수정 중 오류가 발생했습니다: ${err.message}`);
      setIsModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!initialReview) {
    return (
      <div className="edit-review-page">
        <TopHeader />
        <p style={{ padding: "20px", textAlign: "center" }}>
          리뷰 정보를 불러오는 중...
        </p>
        <AlertModal
          isOpen={isModalOpen}
          message={modalMessage}
          onClose={handleModalClose}
        />
      </div>
    );
  }

  return (
    <div className="edit-review-page">
      <AlertModal
        isOpen={isModalOpen}
        message={modalMessage}
        onClose={handleModalClose}
      />

      <TopHeader />

      <form id="review-form" className="er-form" onSubmit={handleSubmit} noValidate>
        {/* 화장실 정보 */}
        <div className="er-field">
          <div className="er-review-info">
            <h3>{initialReview.name}</h3>
            <p>
              {initialReview.line}호선
              <span className="er-review-info-divider">·</span>
              {initialReview.gender === "FEMALE" ? (
                <span className="fe" style={{ color: "#E13A6E" }}>여자</span>
              ) : (
                <span className="ma" style={{ color: "#0D6EFD" }}>남자</span>
              )}
            </p>
          </div>
        </div>

        {/* 별점 */}
        <div className="er-field">
          <label className="er-label-star">
            {renderStars(star, setStar)}
            {errors.star && <p className="er-err">{errors.star}</p>}
          </label>
        </div>

        <img src={ad} width="100%" alt="" />

        {/* 장애인 화장실 태그 */}
        <div className="er-field">
          <label className="er-label">장애인 화장실에 대한 리뷰라면 클릭!</label>
          <div className="er-tags" role="group" aria-label="장애인 편의시설 선택">
            <button
              type="button"
              className={`er-tag ${isDisability ? "is-selected" : ""}`}
              id="disabled"
              aria-pressed={isDisability}
              onClick={() => setIsDisability((prev) => !prev)}
            >
              장애인 화장실
            </button>
          </div>
        </div>

        {/* 긍정 태그 */}
        <div className="er-field">
          <label className="er-label">만족스러워요</label>
          <div className="er-tags" role="group" aria-label="긍정 리뷰 태그 선택">
            {POSITIVE_TAG_KEYS.map((key) => {
              const selected = selectedTags.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  className={`er-tag ${selected ? "is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => toggleTag(key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleTag(key);
                    }
                  }}
                  title={key}
                >
                  {tagMap[key]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 부정 태그 */}
        <div className="er-field">
          <label className="er-label">개선이 필요해요</label>
          <div className="er-tags" role="group" aria-label="부정 리뷰 태그 선택">
            {NEGATIVE_TAG_KEYS.map((key) => {
              const selected = selectedTags.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  className={`er-tag ${selected ? "is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => toggleTag(key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleTag(key);
                    }
                  }}
                  title={key}
                >
                  {tagMap[key]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 리뷰 내용 + 사진 */}
        <div className="er-field">
          <label htmlFor={`${uid}-desc`} className="er-label" />
          
          <div className={`er-textarea-wrapper ${errors.desc ? "er-input-err" : ""}`}>
            <div className="er-photo-previews">
              {existingPhotos.map((photo) => (
                <div key={photo.id} className="er-preview-item">
                  <img src={photo.url} alt="기존 이미지" className="er-preview-img" />
                  <button
                    type="button"
                    className="er-preview-delete"
                    onClick={() => handleDeleteExisting(photo.id)}
                    aria-label="기존 이미지 삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
              {newPhotos.map((photo, index) => (
                <div key={index} className="er-preview-item">
                  <img src={photo.preview} alt="새 이미지 미리보기" className="er-preview-img" />
                  <button
                    type="button"
                    className="er-preview-delete"
                    onClick={() => handleDeleteNew(index)}
                    aria-label="새 이미지 삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <textarea
              id={`${uid}-desc`}
              className="er-textarea"
              placeholder="리뷰를 작성해주세요"
              maxLength={MAX_DESC}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={6}
            />

            <div className="er-textarea-footer">
              <button
                type="button"
                className="er-photo-upload-btn"
                onClick={handlePhotoUploadClick}
                aria-label="사진 업로드"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4.68001 16.6666C4.29612 16.6666 3.97584 16.5383 3.71918 16.2816C3.46251 16.0249 3.3339 15.7044 3.33334 15.3199V4.67992C3.33334 4.29603 3.46195 3.97575 3.71918 3.71909C3.9764 3.46242 4.29668 3.33381 4.68001 3.33325H15.3208C15.7042 3.33325 16.0245 3.46186 16.2817 3.71909C16.5389 3.97631 16.6672 4.29659 16.6667 4.67992V15.3208C16.6667 15.7041 16.5383 16.0244 16.2817 16.2816C16.025 16.5388 15.7045 16.6671 15.32 16.6666H4.68001ZM4.68001 15.8333H15.3208C15.4486 15.8333 15.5661 15.7799 15.6733 15.6733C15.7806 15.5666 15.8339 15.4488 15.8333 15.3199V4.67992C15.8333 4.55159 15.78 4.43381 15.6733 4.32659C15.5667 4.21936 15.4489 4.16603 15.32 4.16659H4.68001C4.55168 4.16659 4.4339 4.21992 4.32668 4.32659C4.21945 4.43325 4.16612 4.55103 4.16668 4.67992V15.3208C4.16668 15.4485 4.22001 15.566 4.32668 15.6733C4.43334 15.7805 4.55084 15.8338 4.67918 15.8333M6.92334 13.7499H13.205C13.34 13.7499 13.4383 13.6896 13.5 13.5691C13.5617 13.4485 13.5533 13.3291 13.475 13.2108L11.7917 10.9508C11.7195 10.8608 11.6297 10.8158 11.5225 10.8158C11.4158 10.8158 11.3261 10.8608 11.2533 10.9508L9.34334 13.3658L8.15418 11.9283C8.0814 11.8488 7.99418 11.8091 7.89251 11.8091C7.7914 11.8091 7.70445 11.8541 7.63168 11.9441L6.67001 13.2108C6.58001 13.3291 6.56612 13.4485 6.62834 13.5691C6.69057 13.6896 6.7889 13.7499 6.92334 13.7499Z" fill="#4860BE"/>
                </svg>
              </button>
              
              <span className="er-count">
                {desc.length}/{MAX_DESC}
              </span>
            </div>
          </div>
          
          {errors.desc && <p className="er-err">{errors.desc}</p>}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          style={{ display: "none" }}
          aria-hidden="true"
        />
    
      </form>

      <div className="er-footer">
        <button
          type="button"
          className="er-btn er-ghost"
          onClick={() => nav(-1)}
          disabled={submitting}
        >
          취소
        </button>
        <button
          type="submit"
          className="er-btn er-primary"
          form="review-form"
          disabled={submitting}
        >
          {submitting ? "저장 중..." : "수정 완료"}
        </button>
      </div>
    </div>
  );
}
