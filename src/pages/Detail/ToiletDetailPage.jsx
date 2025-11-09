import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import ReviewCard from "../../components/review/ReviewCard";
import TopHeader from '../../components/layout/TopHeader';
import './ToiletDetailPage.css';
import starFilled from '../../assets/star/star-yell.svg';
import starEmpty from '../../assets/star/star-grey.svg';
import door from '../../assets/ReviewPage/door.svg';
import location from '../../assets/ReviewPage/location.svg';
import toiletimg from '../../assets/ReviewPage/toilet-img.svg';
import rightsqure from '../../assets/ReviewPage/right-square-filled.svg';

// 1. 화장실 상세 정보 (새 더미데이터)
const toiletDetailResponse = {
  "success": true,
  "code": 200,
  "message": "화장실 상세 조회 성공",
  "data": {
    "id": 1,
    "name": "신촌(지하)",
    "line": 2,
    "gender": "F", // F: 여자, M: 남자
    "star": 4.0,
    "numBigToilet": 10,
    "numSmallToilet": 5,
    "numGate": 2, // 데이터는 2지만, 요청대로 "6번 출구"로 하드코딩
    "inOut": "Out", // Out: 개찰구 밖, In: 개찰구 안
    "latitude": 37.555,
    "longitude": 126.936,
    "numReview": 25
  }
};

const response =  {
  "success": true,
  "code": 200,
  "message": "리뷰 목록 조회 성공",
  "data": [
    {
      "id": 107,
      "userId": 22,
      "userName": "차현서",
      "description": "처음보다 많이 깨끗해졌어요.",
      "star": 4.0,
      "tag": ["TOILET_CLEAN"],
      "photo": [],
      "good": 3,
      "createdAt": "2025-09-20T10:30:00",
      "updatedAt": "2025-09-29T18:45:00",
      "isDis": false
    },
    {
      "id": 106,
      "userId": 18,
      "userName": "한서정",
      "description": "냄새가 심했어요.",
      "star": 2.0,
      "tag": ["BAD_ODOR", "NO_TOILET_PAPER"],
      "photo": [],
      "good": 0,
      "createdAt": "2025-09-28T21:00:00",
      "updatedAt": "2025-09-28T21:00:00",
      "isDis": false
    },
    {
      "id": 105,
      "userId": 31,
      "userName": "최윤서",
      "description": "환기도 잘되고, 핸드워시도 충분해서 좋았어요.",
      "star": 5.0,
      "tag": ["GOOD_VENTILATION", "ENOUGH_HANDSOAP"],
      "photo": ["review_105_img1.jpg"],
      "good": 7,
      "createdAt": "2025-09-25T09:15:00",
      "updatedAt": "2025-09-25T09:15:00",
      "isDis": false
    },
    {
      "id": 108,
      "userId": 27,
      "userName": "이도현",
      "description": "휴지가 없어서 불편했어요.",
      "star": 2.5,
      "tag": ["NO_TOILET_PAPER"],
      "photo": [],
      "good": 1,
      "createdAt": "2025-09-22T14:40:00",
      "updatedAt": "2025-09-22T14:40:00",
      "isDis": false
    },
    {
      "id": 109,
      "userId": 15,
      "userName": "김수연",
      "description": "조명이 밝고 거울이 깨끗해서 좋아요!",
      "star": 4.5,
      "tag": ["BRIGHT_LIGHTING", "CLEAN_MIRROR"],
      "photo": ["review_109_img1.jpg"],
      "good": 6,
      "createdAt": "2025-09-24T11:20:00",
      "updatedAt": "2025-09-24T11:20:00",
      "isDis": false
    },
    {
      "id": 110,
      "userId": 20,
      "userName": "박지현",
      "description": "세면대 주변이 너무 젖어있었어요.",
      "star": 3.0,
      "tag": ["WET_SINK"],
      "photo": [],
      "good": 2,
      "createdAt": "2025-09-26T17:10:00",
      "updatedAt": "2025-09-26T17:10:00",
      "isDis": false
    },
    {
      "id": 111,
      "userId": 19,
      "userName": "정유진",
      "description": "화장실이 넓고 향기도 괜찮았어요.",
      "star": 4.0,
      "tag": ["SPACIOUS", "GOOD_SCENT"],
      "photo": [],
      "good": 5,
      "createdAt": "2025-09-23T08:55:00",
      "updatedAt": "2025-09-23T08:55:00",
      "isDis": false
    },
    {
      "id": 112,
      "userId": 29,
      "userName": "서지훈",
      "description": "변기 물이 잘 안내려가요.",
      "star": 1.5,
      "tag": ["CLOGGED_TOILET"],
      "photo": [],
      "good": 0,
      "createdAt": "2025-09-27T13:45:00",
      "updatedAt": "2025-09-27T13:45:00",
      "isDis": false
    },
    {
      "id": 113,
      "userId": 33,
      "userName": "윤다연",
      "description": "직원분이 바로 청소해주셔서 감사했어요.",
      "star": 5.0,
      "tag": ["KIND_STAFF", "TOILET_CLEAN"],
      "photo": ["review_113_img1.jpg", "review_113_img2.jpg"],
      "good": 8,
      "createdAt": "2025-09-29T16:00:00",
      "updatedAt": "2025-09-29T16:00:00",
      "isDis": false
    },
    {
      "id": 114,
      "userId": 26,
      "userName": "홍예린",
      "description": "손 건조기가 잘 작동하지 않았어요.",
      "star": 2.0,
      "tag": ["BROKEN_HANDDRYER"],
      "photo": [],
      "good": 1,
      "createdAt": "2025-09-21T19:30:00",
      "updatedAt": "2025-09-21T19:30:00",
      "isDis": false
    },
    {
      "id": 115,
      "userId": 23,
      "userName": "신민수",
      "description": "휴지도 충분하고 전체적으로 깔끔했어요!",
      "star": 4.5,
      "tag": ["ENOUGH_TOILET_PAPER", "TOILET_CLEAN"],
      "photo": ["review_115_img1.jpg"],
      "good": 9,
      "createdAt": "2025-09-30T09:10:00",
      "updatedAt": "2025-09-30T09:10:00",
      "isDis": false
    }
  ]
};



function ToiletDetailPage() {

  const nav = useNavigate();

    const toilet = toiletDetailResponse.data;
    const reviews = response.data;

    const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);

    // [추가] 사진이 있는 리뷰만 필터링합니다.
    const photoReviews = reviews.filter(r => r.photo && r.photo.length > 0);

    const renderStars = (starRating, totalStars = 5) => {
        const roundedStars = Math.round(starRating);
        const stars = [];

        for (let i = 1; i <= totalStars; i++) {
          if (i <= roundedStars) {
            stars.push(
              <img key={i} src={starFilled} alt="filled star" className="star-icon" />
            );
          } else {
            stars.push(
              <img key={i} src={starEmpty} alt="empty star" className="star-icon" />
            );
          }
        }

        return <div className="star-rating-container">{stars}</div>;
    };


    return (
    <div className="toilet-detail-page">
        <TopHeader />

        {/* 1. 상단 화장실 정보 섹션 */}
<div className="detail-container">
  {/*이름, 호선, 성별 */}
  <div className="toilet-header">
    <h1 className="toilet-name">{toilet.name}</h1>
    <span className="toilet-info">
      {toilet.line}호선
    <span className="er-review-info-divider">·</span>
      {toilet.gender === "FEMALE" || toilet.gender === "F" ? (
        <span className="fe" style={{ color: "#E13A6E" }}>
          여자
        </span>
      ) : (
        <span className="ma" style={{ color: "#0D6EFD" }}>
          남자
        </span>
      )}
    </span>
  </div>

          {/* 별점 */}
          <div className="toilet-rating">
            <span className="star-icons">{renderStars(toilet.star)}</span>
            <span className="star-number">({toilet.star})</span>
          </div>

          {/* 위치, 시설 정보 */}
          <div className="toilet-location-info">
            <span><img src={door} alt="door" className="door" />{toilet.inOut === 'Out' ? '개찰구 밖' : '개찰구 안'}</span>
            <span><img src={location} alt="location" className="location" />{toilet.numGate}번 출구</span>
            <span><img src={toiletimg} alt="toiletimg" className="toiletimg" />양변기 {toilet.numBigToilet}개</span>
          </div>

          {/* AI 요약 */}
          <div className="ai-summary">
            <button
                className="ai-summary-toggle"
                onClick={() => setIsAiSummaryOpen(!isAiSummaryOpen)}
            >
                <span>AI 요약</span>
                <span>{isAiSummaryOpen ? '' : <img src={rightsqure} alt="rightsquare" className="rightsquare" />}</span>
            </button>
            {isAiSummaryOpen && (
            <div className="ai-summary-content">
              <p>
                이 화장실은 청결도와 편의시설 면에서 긍정적인 평가를 받고 있습니다. 
                특히 환기 시스템과 핸드워시 비치가 잘 되어있다는 리뷰가 많습니다. 
                다만, 특정 시간대에는 냄새 문제가 간혹 언급됩니다.
              </p>
            </div>
          )}
          </div>
        </div>

        {/* --- 구분선 --- */}
      <div className="divider"></div>

      {/* 2. 하단 리뷰 섹션 */}
      <div className="review-container">

        {/* 탭 (리뷰 / 리뷰 작성하기) */}
        <div className="review-tabs">
          <span className="tab-item-active">리뷰 ({toilet.numReview})</span>
          <button className="tab-item" onClick={() => nav(`/review/${toilet.id}/write`, { state: { toilet: toilet } })}>리뷰 작성하기</button>
        </div>

        {/* .photo-review-buttons 클래스 이름을 그대로 쓰거나,
    .photo-review-section 등 새 이름으로 변경해도 됩니다. */}
<div className="photo-review-buttons">
  
  {/* 1. 포토리뷰 보기 헤더 (span 대신 div로 변경) */}
  <div className="photo-button">
    <span>포토리뷰 보기 ▼</span>
  </div>

  {/* 2. 포토들 (예시 리스트) */}
  <div className="photo-list-example">
    {/* 4개의 사각형 예시 */}
    <div className="photo-example-item"></div>
    <div className="photo-example-item"></div>
    <div className="photo-example-item"></div>
    <div className="photo-example-item"></div>
  </div>

  {/* 3. "더보기" 버튼 (오른쪽 정렬을 위한 래퍼 추가) */}
  <div className="photo-more-container">
    <button
      className="photo-button-more"
      onClick={() =>
        // [수정] 새 URL로 photoReviews 데이터와 toilet 정보를 넘깁니다.
        nav(`/review/${toilet.id}/photos`, {
          state: { reviews: photoReviews, toilet: toilet },
        })
      }
    >
      포토리뷰 더보기
    </button>
  </div>

</div>

        {/* 필터 */}
        <div className="review-filters">
          <select>
            <option>최신순</option>
            <option>별점순</option>
          </select>
          <select>
            <option>필터</option>
            <option>장애인 화장실</option>
          </select>
        </div>

        {/* 리뷰 카드 목록 */}
        <div className="review-card-list">
          <ReviewCard reviews={reviews.slice(0, 3)} />
        </div>

        {reviews.length > 3 && (
  <div className="review-more-container">
    <button
      className="review-more-button"
      onClick={() =>
        nav(`/review/${toilet.id}/reviews`, {
          state: { reviews: reviews, toilet: toilet },
        })
      }
    >
      리뷰 더보기
    </button>
  </div>
)}

      </div> {/* .review-container 끝 */}
    </div>
  );
}

export default ToiletDetailPage;