import React, { useId, useState, useEffect } from "react";
// [수정] useParams 훅을 추가로 임포트합니다.
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TopHeader from "../../components/layout/TopHeader";
import star_yell from "../../assets/star/star-yell.svg";
import star_grey from "../../assets/star/star-grey.svg";
// [수정] CSS 파일 경로를 새 컴포넌트에 맞게 변경합니다.
import "./WriteReviewPage.css"; // EditReview.css -> WriteReviewPage.css
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
// 앞의 5개 = 긍정, 6번째부터 = 부정
const POSITIVE_TAG_KEYS = TAG_KEYS.slice(0, 5);
const NEGATIVE_TAG_KEYS = TAG_KEYS.slice(5);

// [수정] 컴포넌트 이름을 WriteReview로 변경
export default function WriteReview() {
  const location = useLocation();
  const nav = useNavigate();
  // [수정] URL 파라미터에서 stationId를 가져옵니다.
  const { stationId } = useParams();

  // [수정] state에서 'review' 대신 'toilet' 정보를 받습니다.
  const toilet = location.state?.toilet;

  // [수정] 'toilet' 정보가 없으면 페이지를 이탈시킵니다.
  useEffect(() => {
    if (!toilet) {
      alert("잘못된 접근입니다. 화장실 정보가 없습니다.");
      nav("/"); // 메인 페이지나 이전 페이지로 이동
    }
  }, [toilet, nav]);

  // [수정] State 초기값을 '빈 값'으로 설정합니다.
  const [star, setStar] = useState(0); // 0점으로 시작
  const [desc, setDesc] = useState(""); // 빈 문자열
  const [isDisability, setIsDisability] = useState(false); // 기본값 false
  const [selectedTags, setSelectedTags] = useState(new Set()); // 빈 Set

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const uid = useId();
  const MAX_DESC = 1000;

  // toggleTag 함수
  const toggleTag = (key) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);

      if (next.has(key)) {
        // 1. 태그를 "제거"하는 경우: 항상 허용
        next.delete(key);
        return next;
      } else {
        // 2. 태그를 "추가"하는 경우
        if (prev.size < 3) {
          // 3개 미만이면 추가
          next.add(key);
          return next;
        } else {
          // 3. 3개일 때 4번째 태그를 추가하려는 경우
          setIsModalOpen(true);
          // 4. 상태 변경을 취소하고 "이전" 상태(prev)를 반환
          return prev;
        }
      }
    });
  };

  // validate 함수
  const validate = () => {
    const next = {};
    if (!star || star < 1) next.star = "별점을 선택하세요.";
    if (!desc.trim()) next.desc = "리뷰를 작성해주세요."; // Placeholder와 일치
    if (desc.length > MAX_DESC)
      next.desc = `설명은 ${MAX_DESC}자 이내로 입력하세요.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // [수정] handleSubmit 로직을 'POST' (생성)으로 변경
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 'toilet' 정보가 유효한지도 확인
    if (!validate() || !toilet || !stationId) return;

    setSubmitting(true);

    const payload = {
      stationId: Number(stationId), // [추가] stationId를 페이로드에 포함
      star: Number(star),
      desc: desc.trim(),
      tags: Array.from(selectedTags),
      is_disability: Boolean(isDisability),
    };

    try {
      // [수정] API 엔드포인트를 '생성'용으로 변경 (예: /api/reviews)
      const response = await fetch(`/api/reviews`, {
        method: "POST", // [수정] PUT -> POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
      }

      console.log("[WriteReview] submit payload:", payload);
      alert("리뷰가 등록되었습니다."); // [수정] '수정' -> '등록'
      nav(-1); // 이전 페이지(화장실 상세)로 이동
    } catch (err) {
      console.error(err);
      alert(`등록 중 오류가 발생했습니다: ${err.message}`); // [수정] '수정' -> '등록'
    } finally {
      setSubmitting(false);
    }
  };

  // [수정] 로딩 뷰의 조건을 'toilet'으로 변경
  if (!toilet) {
    return (
      // [수정] className 변경
      <div className="write-review-page">
        <TopHeader />
        <p style={{ padding: "20px", textAlign: "center" }}>
          화장실 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  return (
    // [수정] className 변경
    <div className="write-review-page">
      <AlertModal
        isOpen={isModalOpen}
        message="최대 3개까지 선택 가능합니다."
        onClose={() => setIsModalOpen(false)} // "확인" 버튼 클릭 시 모달 닫기
      />

      <TopHeader />

      <form id="review-form" className="er-form" onSubmit={handleSubmit} noValidate>
        {/* [수정] 화장실 정보를 initialReview 대신 toilet에서 표시 */}
        <div className="er-field">
          <div className="er-review-info">
            <h3>{toilet.name}</h3>
            <p>
              {toilet.line}호선
              <span className="er-review-info-divider">·</span>
              {/* API 응답 값에 따라 'F' 또는 'FEMALE'을 확인하세요 */}
              {toilet.gender === "FEMALE" || toilet.gender === "F" ? (
                <span className="fe" style={{ color: "#E13A6E" }}>
                  여자
                </span>
              ) : (
                <span className="ma" style={{ color: "#0D6EFD" }}>
                  남자
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 별점 */}
        <div className="er-field">
          <label className="er-label-star">
            {renderStars(star, setStar, 40)}
            {errors.star && <p className="er-err">{errors.star}</p>}
          </label>
        </div>

        <img src={ad} width="100%" alt="" />

        {/* 장애인 화장실 태그 */}
        <div className="er-field">
          <label className="er-label">
            장애인 화장실에 대한 리뷰라면 클릭!
          </label>
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

        {/* 설명 (Text Area) */}
        <div className="er-field">
          <label htmlFor={`${uid}-desc`} className="er-label">
            {/* 비어있는 라벨 */}
          </label>

          <div
            className={`er-textarea-wrapper ${
              errors.desc ? "er-input-err" : ""
            }`}
          >
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M4.68001 16.6666C4.29612 16.6666 3.97584 16.5383 3.71918 16.2816C3.46251 16.0249 3.3339 15.7044 3.33334 15.3199V4.67992C3.33334 4.29603 3.46195 3.97575 3.71918 3.71909C3.9764 3.46242 4.29668 3.33381 4.68001 3.33325H15.3208C15.7042 3.33325 16.0245 3.46186 16.2817 3.71909C16.5389 3.97631 16.6672 4.29659 16.6667 4.67992V15.3208C16.6667 15.7041 16.5383 16.0244 16.2817 16.2816C16.025 16.5388 15.7045 16.6671 15.32 16.6666H4.68001ZM4.68001 15.8333H15.3208C15.4486 15.8333 15.5661 15.7799 15.6733 15.6733C15.7806 15.5666 15.8339 15.4488 15.8333 15.3199V4.67992C15.8333 4.55159 15.78 4.43381 15.6733 4.32659C15.5667 4.21936 15.4489 4.16603 15.32 4.16659H4.68001C4.55168 4.16659 4.4339 4.21992 4.32668 4.32659C4.21945 4.43325 4.16612 4.55103 4.16668 4.67992V15.3208C4.16668 15.4485 4.22001 15.566 4.32668 15.6733C4.43334 15.7805 4.55084 15.8338 4.67918 15.8333M6.92334 13.7499H13.205C13.34 13.7499 13.4383 13.6896 13.5 13.5691C13.5617 13.4485 13.5533 13.3291 13.475 13.2108L11.7917 10.9508C11.7195 10.8608 11.6297 10.8158 11.5225 10.8158C11.4158 10.8158 11.3261 10.8608 11.2533 10.9508L9.34334 13.3658L8.15418 11.9283C8.0814 11.8488 7.99418 11.8091 7.89251 11.8091C7.7914 11.8091 7.70445 11.8541 7.63168 11.9441L6.67001 13.2108C6.58001 13.3291 6.56612 13.4485 6.62834 13.5691C6.69057 13.6896 6.7889 13.7499 6.92334 13.7499Z"
                  fill="#4860BE"
                />
              </svg>

              <span className="er-count">
                {desc.length}/{MAX_DESC}
              </span>
            </div>
          </div>

          {errors.desc && <p className="er-err">{errors.desc}</p>}
        </div>
      </form>

      {/* 고정 하단 액션 (고정X, 일반 div) */}
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
          {/* [수정] 버튼 텍스트 변경 */}
          {submitting ? "등록 중..." : "등록 완료"}
        </button>
      </div>
    </div>
  );
}