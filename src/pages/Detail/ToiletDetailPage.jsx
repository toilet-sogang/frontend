import React, {useState} from "react";
import ReviewCard from "../../components/review/ReviewCard";
import TopHeader from '../../components/layout/TopHeader';
import './ToiletDetailPage.css';

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
    "star": 4.8,
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
    }
  ]
};


function ToiletDetailPage() {

    const toilet = toiletDetailResponse.data;
    const reviews = response.data;

    const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);

    const renderStars = (starRating) => {
        const roundedStars = Math.round(starRating);
        return '⭐'.repeat(roundedStars);
    };


    return (
    <div className="toilet-detail-page">
        <TopHeader />

        {/* 1. 상단 화장실 정보 섹션 */}
        <div className="detail-container">
          {/*이름, 호선, 성별 */}
          <div className="toilet-hedaer">
            <h1 className="toilet-name">{toilet.name}</h1>
            <span className="toilet-info">
                {toilet.line}호선 · {toilet.gender === 'F' ? '여자' : '남자'}
            </span>
          </div>

          {/* 별점 */}
          <div className="toilet-rating">
            <span className="star-icons">{renderStars(toilet.star)}</span>
            <span className="star-number">({toilet.star})</span>
          </div>

          {/* 위치, 시설 정보 */}
          <div className="toilet-location-info">
            <span>{toilet.inOut === 'Out' ? '개찰구 밖' : '개찰구 안'} 6번 출구</span>
            <span></span>
            <span>양변기 {toilet.numBigToilet}개</span>
          </div>

          {/* AI 요약 */}
          <div className="ai-summary">
            <button
                className="ai-summary-toggle"
                onClick={() => setIsAiSummaryOpen(!isAiSummaryOpen)}
            >
                <span>AI 요약</span>
                <span>{isAiSummaryOpen ? '▲' : '▼'}</span>
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
          <span className="tab-item active">리뷰 ({toilet.numReview})</span>
          <span className="tab-item">리뷰 작성하기</span>
        </div>

        {/* 포토리뷰 버튼 */}
        <div className="photo-review-buttons">
          <button className="photo-button">포토리뷰 보기</button>
          <button className="photo-button-more">포토리뷰 더보기</button>
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
          <ReviewCard reviews={reviews} />
        </div>

      </div> {/* .review-container 끝 */}
    </div>
  );
}

export default ToiletDetailPage;