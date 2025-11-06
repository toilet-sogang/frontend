import React, { useId, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopHeader from "../../components/layout/TopHeader";
import star_yell from "../../assets/star/star-yell.svg";
import star_grey from "../../assets/star/star-grey.svg";
import "./EditReview.css";
import ad from "../../assets/MyPage/ad_edit.svg";
import AlertModal from "../../components/layout/AlertModal";

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
              width={size}
              height={size}
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
// 앞의 5개 = 긍정, 6번째부터 = 부정
const POSITIVE_TAG_KEYS = TAG_KEYS.slice(0, 5);
const NEGATIVE_TAG_KEYS = TAG_KEYS.slice(5);

export default function EditReview() {
  const location = useLocation();
  const nav = useNavigate();

  const initialReview = location.state?.review;

  // === ⬇️ MODIFIED MODAL STATE ⬇️ ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  // [신규] 모달에 표시될 메시지를 state로 관리
  const [modalMessage, setModalMessage] = useState("");
  // [신규] 모달이 닫힌 "후"에 실행할 동작(예: 페이지 이동)을 state로 관리
  const [modalCloseAction, setModalCloseAction] = useState(null);

  // [신규] 모달 닫기 공통 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalMessage("");
    // 모달 닫기 액션이 설정되어 있다면 실행
    if (typeof modalCloseAction === 'function') {
      modalCloseAction();
    }
    setModalCloseAction(null); // 액션 초기화
  };
  // === ⬆️ MODIFIED MODAL STATE ⬆️ ===

  useEffect(() => {
    if (!initialReview) {
      // [수정] alert -> modal
      // alert("잘못된 접근입니다. 리뷰 정보가 없습니다.");
      setModalMessage("잘못된 접근입니다. 리뷰 정보가 없습니다.");
      // [수정] 모달이 닫히면 /mypage로 이동하도록 액션 설정
      setModalCloseAction(() => () => nav("/mypage"));
      setIsModalOpen(true);
      // nav("/mypage"); // <-- 모달이 닫힌 후에 실행되도록 위로 이동
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
          // [수정] 하드코딩된 메시지 대신 state에 메시지 설정
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
    if (desc.length > MAX_DESC) next.desc = `설명은 ${MAX_DESC}자 이내로 입력하세요.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /** 1. 숨겨진 파일 입력창을 클릭합니다. */
  const handlePhotoUploadClick = () => {
    if (existingPhotos.length + newPhotos.length >= MAX_PHOTOS) {
      // [수정] alert -> modal
      // alert(`사진은 최대 ${MAX_PHOTOS}장까지 업로드할 수 있습니다.`);
      setModalMessage(`사진은 최대 ${MAX_PHOTOS}장까지 업로드할 수 있습니다.`);
      setIsModalOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  /** 2. 파일이 선택되면 상태에 추가합니다. */
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const currentTotal = existingPhotos.length + newPhotos.length;
    const remainingSlots = MAX_PHOTOS - currentTotal;

    if (files.length > remainingSlots) {
      // [수정] alert -> modal
      // alert(`최대 ${MAX_PHOTOS}장까지 업로드 가능합니다.`);
      setModalMessage(`최대 ${MAX_PHOTOS}장까지 업로드 가능합니다.`);
      setIsModalOpen(true);
    }

    // 추가할 파일만 잘라내어 미리보기 URL 생성
    const filesToAdd = files.slice(0, remainingSlots).map((file) => ({
      file: file,
      preview: URL.createObjectURL(file), // 미리보기를 위한 임시 URL
    }));

    setNewPhotos((prev) => [...prev, ...filesToAdd]);

    if (event.target) {
      event.target.value = null;
    }
  };

  /** 3. 기존 사진 삭제 (X 버튼 클릭) */
  const handleDeleteExisting = (idToDelete) => {
    setExistingPhotos((prev) =>
      prev.filter((photo) => photo.id !== idToDelete)
    );
    setDeletedPhotos((prev) => [...prev, idToDelete]);
  };

  /** 4. 새로 추가한 사진 삭제 (X 버튼 클릭) */
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

  /** 5. 컴포넌트가 사라질 때 생성된 모든 미리보기 URL을 해제합니다. */
  useEffect(() => {
    return () => {
      newPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, [newPhotos]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !initialReview) return;

    setSubmitting(true);
    const formData = new FormData();

    formData.append("star", Number(star));
    formData.append("desc", desc.trim());
    formData.append("is_disability", Boolean(isDisability));
    formData.append("tags", JSON.stringify(Array.from(selectedTags)));
    formData.append("requestString", JSON.stringify(deletedPhotos));
    newPhotos.forEach((photo) => {
      formData.append("photosList", photo.file, photo.file.name);
    });

    try {
      console.log("--- 폼 데이터 전송 준비 완료 (API 연동 대기) ---");
      // ... (console.log 생략) ...
      await new Promise(resolve => setTimeout(resolve, 1000));

      // [수정] alert -> modal
      // alert("리뷰가 수정되었습니다. (API 연동 대기)");
      setModalMessage("리뷰가 수정되었습니다. (API 연동 대기)");
      // [수정] 모달이 닫히면 이전 페이지(-1)로 이동하도록 액션 설정
      setModalCloseAction(() => () => nav(-1));
      setIsModalOpen(true);
      // nav(-1); // <-- 모달이 닫힌 후에 실행되도록 위로 이동

    } catch (err) {
      console.error(err);
      // [수정] alert -> modal
      // alert(`수정 중 오류가 발생했습니다: ${err.message}`);
      setModalMessage(`수정 중 오류가 발생했습니다: ${err.message}`);
      setIsModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!initialReview) {
    // 이 컴포넌트는 useEffect의 모달 + 리다이렉트가 실행될 때까지
    // 잠시 렌더링될 수 있으므로, 로딩 상태를 반환합니다.
    return (
      <div className="edit-review-page">
        <TopHeader />
        <p style={{ padding: "20px", textAlign: "center" }}>
          리뷰 정보를 불러오는 중...
        </p>
        {/* [수정] 모달 렌더링 로직을 여기에도 추가 (필수) */}
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
      {/* [수정] AlertModal props를 동적으로 변경 */}
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
              id="disabled" aria-pressed={isDisability}
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

        {/* === ⬇️ MODIFIED Text Area ⬇️ === */}
        <div className="er-field">
          <label htmlFor={`${uid}-desc`} className="er-label">
            {/* 비어있는 라벨 */}
          </label>
          
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
          accept="image/*" // 이미지 파일만
          multiple // 여러 장 선택 가능하게
          style={{ display: "none" }} // 화면에 보이지 않게
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