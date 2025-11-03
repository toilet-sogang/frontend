import React, { useId, useState } from "react";
import TopHeader from "../../components/layout/TopHeader";


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

export default function EditReview({ initialReview, onCancel, onSaved }) {
  // initialReview가 주어지면 프리필; 없으면 기본값
  const [star, setStar] = useState(
    typeof initialReview?.star === "number" ? initialReview.star : 0
  );
  const [desc, setDesc] = useState(initialReview?.desc ?? "");
  const [isDisability, setIsDisability] = useState(
    Boolean(initialReview?.is_disability ?? false)
  );
  const [selectedTags, setSelectedTags] = useState(
    new Set(
      Array.isArray(initialReview?.tags)
        ? initialReview.tags.filter((k) => tagMap[k])
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
    if (!validate()) return;

    setSubmitting(true);

    // 🔽 백엔드 요청 바디 스펙에 맞춰 변환
    const payload = {
      star: Number(star),                 // Double
      desc: desc.trim(),                  // String
      tags: Array.from(selectedTags),     // List<Enum>
      is_disability: Boolean(isDisability), // Boolean
    };

    try {
      // TODO: 실제 API 엔드포인트로 교체하세요.
      // 예시:
      // const reviewId = initialReview?.id; // 필요 시 사용
      // await fetch(`/api/reviews/${reviewId}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      console.log("[EditReview] submit payload:", payload);
      onSaved?.(payload);
      alert("리뷰가 저장되었습니다.");
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="edit-review-page">
      <TopHeader />

      <form className="er-form" onSubmit={handleSubmit} noValidate>
        {/* 별점 */}
        <div className="er-field">
          <label className="er-label">별점</label>
          <div className="er-stars" role="radiogroup" aria-label="별점 선택">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={star === n}
                className={`er-star ${star >= n ? "is-active" : ""}`}
                onClick={() => setStar(n)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowUp")
                    setStar((s) => Math.min(5, (s || 0) + 1));
                  if (e.key === "ArrowLeft" || e.key === "ArrowDown")
                    setStar((s) => Math.max(1, (s || 0) - 1));
                }}
              >
                ★
              </button>
            ))}
          </div>
          {errors.star && <p className="er-err">{errors.star}</p>}
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
          <div className="er-hintrow">
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
          </div>
        </div>

        {/* 장애인 여부 스위치 */}
        <div className="er-field er-inline">
          <label className="er-label">장애인 여부</label>
          <label className="er-switch">
            <input
              type="checkbox"
              checked={isDisability}
              onChange={(e) => setIsDisability(e.target.checked)}
            />
            <span className="er-slider" />
          </label>
        </div>

        {/* 하단 공간 (고정 버튼과 겹침 방지) */}
        <div style={{ height: 88 }} />
      </form>

      {/* 고정 하단 액션 */}
      <div className="er-footer">
        <button
          type="button"
          className="er-btn er-ghost"
          onClick={() => onCancel?.()}
          disabled={submitting}
        >
          취소
        </button>
        <button
          type="submit"
          className="er-btn er-primary"
          form={undefined}
          onClick={(e) => {
            const form = e.currentTarget
              .closest(".edit-review-page")
              ?.querySelector("form");
            form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
          }}
          disabled={submitting}
        >
          {submitting ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
