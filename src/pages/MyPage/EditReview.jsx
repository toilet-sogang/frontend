import React, { useId, useState, useEffect } from "react";
// [수정] react-router-dom 훅 임포트
import { useLocation, useNavigate } from "react-router-dom";
import TopHeader from "../../components/layout/TopHeader";
import star_yell from "../../assets/star/star-yell.svg";
import star_grey from "../../assets/star/star-grey.svg";
import "./EditReview.css";
import ad from "../../assets/MyPage/ad_edit.svg";

// [유지] 요청하신 이미지 활용 별점 함수
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
              if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange?.(Math.min(5, (star || 0) + 1));
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange?.(Math.max(1, (star || 0) - 1));
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


/** 백엔드 enum -> 라벨 매핑 (요청한 규칙 그대로) */
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

// [수정] props ({ initialReview, onCancel, onSaved }) 제거
export default function EditReview() {
  // [수정] 라우터 훅 사용
  const location = useLocation();
  const nav = useNavigate();

  // MyPage에서 state로 넘겨준 review 객체를 initialReview로 사용
  const initialReview = location.state?.review;

  // [수정] initialReview가 없을 경우 마이페이지로 돌려보냄 (URL로 직접 접근 방지)
  useEffect(() => {
    if (!initialReview) {
      alert("잘못된 접근입니다. 리뷰 정보가 없습니다.");
      nav("/mypage");
    }
  }, [initialReview, nav]);

  // [수정] initialReview?.tags -> initialReview?.tag (MyPage 데이터 구조에 맞게 수정)
  const [star, setStar] = useState(
    typeof initialReview?.star === "number" ? initialReview.star : 0
  );
  const [desc, setDesc] = useState(initialReview?.desc ?? "");
  const [isDisability, setIsDisability] = useState(
    Boolean(initialReview?.is_disability ?? false) // MyPage 데이터에 is_disability가 없으면 false로 기본값 설정
  );
  const [selectedTags, setSelectedTags] = useState(
    new Set(
      Array.isArray(initialReview?.tag) // MyPage 데이터('tag')를 기반으로 Set 생성
        ? initialReview.tag.filter((k) => tagMap[k])
        : []
    )
  );

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const uid = useId();

  const MAX_DESC = 1000;

  const toggleTag = (key) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const validate = () => {
    const next = {};
    if (!star || star < 1) next.star = "별점을 선택하세요.";
    if (!desc.trim()) next.desc = "리뷰 설명을 입력하세요.";
    if (desc.length > MAX_DESC) next.desc = `설명은 ${MAX_DESC}자 이내로 입력하세요.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !initialReview) return; // initialReview 없으면 제출 방지

    setSubmitting(true);

    // 🔽 백엔드 요청 바디 스펙 (요청하신 타입대로)
    const payload = {
      star: Number(star),                 // Double
      desc: desc.trim(),                  // String
      tags: Array.from(selectedTags),     // List<Enum>
      is_disability: Boolean(isDisability), // Boolean
    };

    // [수정] API 요청 로직 추가
    try {
      // MyPage에서 넘겨받은 review의 id
      const reviewId = initialReview.id;

      // TODO: 실제 API 엔드포인트로 교체하세요. (예: /api/reviews/{reviewId})
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT", // 또는 "PATCH"
        headers: {
          "Content-Type": "application/json",
          // TODO: 필요 시 인증 토큰 헤더 추가
          // "Authorization": `Bearer ${your_auth_token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // 나중에 손보실 수 있도록 error handling 예시 추가
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
      }

      console.log("[EditReview] submit payload:", payload);
      alert("리뷰가 수정되었습니다.");
      nav(-1); // [수정] 저장이 성공하면 이전 페이지(MyPage)로 이동
    } catch (err) {
      console.error(err);
      alert(`수정 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // initialReview가 로드되기 전(혹은 없는) 경우 로딩 표시
  if (!initialReview) {
    return (
      <div className="edit-review-page">
        <TopHeader />
        <p style={{ padding: "20px", textAlign: "center" }}>
          리뷰 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  return (
    <div className="edit-review-page">
      <TopHeader />

      {/* [수정] 폼에 id 추가 (하단 버튼에서 참조) */}
      <form id="review-form" className="er-form" onSubmit={handleSubmit} noValidate>

        {/* [추가] 화장실 정보 표시 (별점 위) */}
        <div className="er-field">

          <div className="er-review-info">
            <h3>{initialReview.name}</h3>
            <p>
              {initialReview.line}호선
              <span className="er-review-info-divider">·</span>
              {initialReview.gender === "FEMALE" ? (
                <span style={{ color: "#E13A6E" }}>여자</span>
              ) : (
                <span style={{ color: "#0D6EFD" }}>남자</span>
              )}
            </p>
          </div>
        </div>

        {/* 별점 (이미지 사용 함수 호출) */}
        <div className="er-field">
          <label className="er-label-star">
          {renderStars(star, setStar)}
          {errors.star && <p className="er-err">{errors.star}</p>}
          </label>

        </div>
        <img src={ad} width="100%" alt="" />


        <div className="er-field">
          <label className="er-label">장애인 화장실에 대한 리뷰라면 클릭!</label>
          <div className="er-tags" role="group" aria-label="장애인 편의시설 선택">
            <button
              type="button"
              className={`er-tag ${isDisability ? "is-selected" : ""}`}
              aria-pressed={isDisability}
              onClick={() => setIsDisability((prev) => !prev)}
            >
              장애인 화장실
            </button>
          </div>
        </div>


                {/* 태그 멀티선택 */}
        <div className="er-field">
          <label className="er-label">태그 선택</label>
          <div className="er-tags" role="group" aria-label="리뷰 태그 선택">
            {TAG_KEYS.map((key) => {
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
          {/* <div className="er-hintrow">
            <span className="er-count">{selectedTags.size}개 선택</span>
            {selectedTags.size > 0 && (
              <button
                type="button"
                className="er-tag-clear"
                onClick={() => setSelectedTags(new Set())}
              >
                전체 해제
              </button>
            )}
          </div> */}
        </div>



        {/* 설명 */}
        <div className="er-field">
          <label htmlFor={`${uid}-desc`} className="er-label">
            리뷰 상세 설명
          </label>
          <textarea
            id={`${uid}-desc`}
            className={`er-textarea ${errors.desc ? "er-input-err" : ""}`}
            placeholder="사용 경험을 자세히 적어주세요"
            maxLength={MAX_DESC}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={6}
          />
          <div className="er-hintrow">
            <span className="er-count">
              {desc.length}/{MAX_DESC}
            </span>
          </div>
          {errors.desc && <p className="er-err">{errors.desc}</p>}
        </div>






        {/* 하단 공간 (고정 버튼과 겹침 방지) */}
        <div style={{ height: 88 }} />
      </form>

      {/* 고정 하단 액션 */}
      <div className="er-footer">
        <button
          type="button"
          className="er-btn er-ghost"
          onClick={() => nav(-1)} // [수정] "취소" 시 마이페이지로 이동
          disabled={submitting}
        >
          취소
        </button>
        <button
          type="submit"
          className="er-btn er-primary"
          form="review-form" // [수정] 폼 id로 연결
          disabled={submitting}
        >
          {submitting ? "저장 중..." : "수정 완료"}
        </button>
      </div>
    </div>
  );
}