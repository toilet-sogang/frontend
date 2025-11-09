import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopHeader from "../../components/layout/TopHeader";

// [필요] ToiletDetailPage/WriteReviewPage 등에서 SVG와 tagMap을 가져옵니다.
import star_yell from "../../assets/star/star-yell.svg";
import star_grey from "../../assets/star/star-grey.svg";

// [필요] 이 페이지를 위한 CSS 파일
import "./PhotoReviewDetailPage.css";

// --- 유틸리티 함수 (다른 파일에서 복사) ---

// 별점 렌더링 함수 (onChange 기능이 필요 없으므로 단순화)
const renderStars = (starRating, totalStars = 5) => {
  const roundedStars = Math.round(starRating);
  const stars = [];
  for (let i = 1; i <= totalStars; i++) {
    stars.push(
      <img
        key={i}
        src={i <= roundedStars ? star_yell : star_grey}
        alt={i <= roundedStars ? "filled star" : "empty star"}
        className="prdp-star-icon" // CSS에서 크기 조절
      />
    );
  }
  return <div className="prdp-rating">{stars}</div>;
};

// 태그 맵 (다른 파일에서 복사)
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
  // (ToiletDetailPage의 더미 데이터에 있던 태그 추가)
  WET_SINK: "세면대 주변이 젖었어요",
  SPACIOUS: "화장실이 넓어요",
  GOOD_SCENT: "향기가 좋아요",
  CLOGGED_TOILET: "변기 물이 잘 안내려가요",
  KIND_STAFF: "직원분이 친절해요",
  BROKEN_HANDDRYER: "손 건조기가 고장났어요",
  ENOUGH_TOILET_PAPER: "휴지가 충분해요",
  CLEAN_MIRROR: "거울이 깨끗해요", // (데이터에 오타가 있었을 수 있음)
};

// --- 메인 컴포넌트 ---

export default function PhotoReviewDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. PhotoReviewsPage에서 넘겨준 데이터 받기
  const { review, toilet } = location.state || {};

  // 2. 데이터 가드
  useEffect(() => {
    if (!review || !toilet) {
      alert("잘못된 접근입니다. 리뷰 정보를 불러올 수 없습니다.");
      navigate(-1);
    }
  }, [review, toilet, navigate]);

  // 3. 로딩 UI
  if (!review || !toilet) {
    return (
      <div className="photo-review-detail-page">
        <TopHeader />
        <p style={{ padding: "20px", textAlign: "center" }}>
          리뷰 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  // 4. 날짜 포맷팅 (예: "2025-09-20T10:30:00" -> "2025.09.20")
  const displayDate = review.createdAt
    ? review.createdAt.split("T")[0].replace(/-/g, ".")
    : "";

  return (
    <div className="photo-review-detail-page">
      <TopHeader />

      {/* 1. 사진 캐러셀 (가로 스크롤) */}
      <div className="prdp-photo-list">
        {review.photo && review.photo.length > 0 ? (
          review.photo.map((photoUrl, index) => (
            <img
              key={index}
              // [중요] 현재 photoUrl은 "review_105_img1.jpg" 같은 문자열입니다.
              // 실제 작동하려면 이 문자열을 실제 이미지 경로로 변환해야 합니다.
              // (예: `https://your-s3-bucket.com/${photoUrl}`)
              // 지금은 임시 플레이스홀더를 사용합니다.
              src={`https://via.placeholder.com/300x300.png?text=Photo+${index + 1}`}
              alt={`포토리뷰 ${index + 1}`}
              className="prdp-photo-item"
            />
          ))
        ) : (
          <div className="prdp-photo-item prdp-photo-placeholder">
            사진이 없습니다.
          </div>
        )}
      </div>

      {/* 2. 리뷰 상세 내용 (ReviewCard와 유사) */}
      <div className="prdp-content-container">
        {/* 작성자 정보 */}
        <div className="prdp-user-info">
          <span className="prdp-user-name">{review.userName}</span>
          {renderStars(review.star)}
        </div>

        {/* 태그 */}
        <div className="prdp-tags">
          {review.tag.map((tagKey) => (
            <span key={tagKey} className="prdp-tag">
              {tagMap[tagKey] || tagKey}
            </span>
          ))}
        </div>

        {/* 리뷰 본문 */}
        <p className="prdp-description">{review.description}</p>

        {/* 작성일 */}
        <span className="prdp-date">{displayDate}</span>
      </div>
    </div>
  );
}