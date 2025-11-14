import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReviewCard from "../../components/review/ReviewCard";
import TopHeader from "../../components/layout/TopHeader";
import "./AllReviewsPage.css";
import AdBannerSvg from "../../assets/ReviewPage/adRectangle.svg";
import ReturnToSearch from "../../components/layout/ReturnToSearch";


// 한 페이지에 보여줄 리뷰 개수
const REVIEWS_PER_PAGE = 5;

export default function AllReviewsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 2. ToiletDetailPage에서 state로 넘겨준 데이터 받기
  const { reviews, toilet } = location.state || {};

  // 3. 페이지네이션을 위한 현재 페이지 state (1페이지부터 시작)
  const [currentPage, setCurrentPage] = useState(1);
  
  // 2. [신규] 필터/정렬을 위한 state (ToiletDetailPage와 동일)
  const [sortType, setSortType] = useState("LATEST");

  const [isPhotoSectionOpen, setIsPhotoSectionOpen] = useState(false);

  // 4. [중요] 데이터가 없는 경우(직접 URL로 접근 등) 처리
  useEffect(() => {
    if (!reviews || !toilet) {
      alert("잘못된 접근입니다. 리뷰 정보를 불러올 수 없습니다.");
      // 이전 페이지로 돌려보내거나, toiletId가 있다면 API를 재요청
      navigate(-1); // 가장 간단하게는 뒤로가기
    }
  }, [reviews, toilet, navigate]);

  // 3. [신규] useMemo를 사용해 sortType이 바뀔 때마다 리뷰 목록을 다시 정렬/필터링
  const filteredReviews = useMemo(() => {
    // reviews가 배열이 아니면(예: null) 빈 배열을 사용
    const sourceReviews = Array.isArray(reviews) ? reviews : [];
    
    switch (sortType) {
      case "RATING":
        // 별점순 (내림차순)
        return [...sourceReviews].sort((a, b) => b.star - a.star);
      
      case "HANDICAPPED":
        // 장애인 화장실 (API 응답 'isDis' 기준)
        return sourceReviews.filter(r => r.isDis === true);
        
      case "LATEST":
      default:
        // 최신순 (내림차순)
        return [...sourceReviews].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  }, [reviews, sortType]); // reviews나 sortType이 바뀔 때만 다시 계산


  // 5. 데이터가 없는 경우 로딩 또는 fallback UI
  if (!reviews || !toilet) {
    return (
      <div className="all-reviews-page">
        <TopHeader />
        <p style={{ padding: "20px", textAlign: "center" }}>
          리뷰 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  

  // --- 페이지네이션 로직 ---
  // 6. 현재 페이지에 보여줄 리뷰 계산
  const indexOfLastReview = currentPage * REVIEWS_PER_PAGE;
  const indexOfFirstReview = indexOfLastReview - REVIEWS_PER_PAGE;
  // 4. [수정] .slice()의 대상이 'reviews' -> 'filteredReviews'로 변경
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);

  // 7. 전체 페이지 수 계산
  // 5. [수정] .length의 대상이 'reviews' -> 'filteredReviews'로 변경
  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);

  // 8. 페이지 번호 배열 생성 (예: [1, 2, 3])
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  // --- 로직 끝 ---

  // 페이지 변경 핸들러
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // 페이지 변경 시 맨 위로 스크롤
  };

  return (
    <div className="all-reviews-page">
      <TopHeader />
      <ReturnToSearch />
      <div className="all-reviews-container">
        {/* 어떤 화장실의 리뷰인지 상단에 표시 */}
        <div className="all-reviews-header">
          <div className="all-reviews-header-info">
            <h3>{toilet.name}</h3>
            <p>
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
            </p>
          </div>
          {/* 6. [수정] 리뷰 카운트도 filteredReviews.length로 변경 */}
          <span className="review">리뷰 ({filteredReviews.length})</span>
        </div>

        {/* [추가] 광고 배너 (리뷰 텍스트와 필터 사이에 배치) */}
        <div className="ad-banner-wrapper">
          <img src={AdBannerSvg} alt="광고 배너" className="ad-banner-image" />
        </div>

        {/* 7. [수정] ToiletDetailPage의 필터 UI와 동일하게 수정 (하나로 통합) */}
        <div className="review-filters">
          
          {/* 👇 [2. 토글 버튼 추가] */}
          <button 
            className="photo-toggle-button" // (CSS에서 스타일 추가 필요)
            onClick={() => setIsPhotoSectionOpen(prev => !prev)}
          >
            {isPhotoSectionOpen ? '사진 숨기기' : '사진 보기'}
          </button>
          <select 
            value={sortType} 
            onChange={(e) => {
              setSortType(e.target.value);
              setCurrentPage(1); // 필터 변경 시 1페이지로 리셋
            }}
          >
            <option value="LATEST">최신순</option>
            <option value="RATING">별점순</option>
            <option value="HANDICAPPED">장애인 화장실</option>
          </select>
          {/* 두 번째 select 제거 */}
        </div>

        {/* 9. ReviewCard에 '현재 페이지'의 리뷰 목록(currentReviews) 전달 */}
        <div className="review-card-list">
          {/* 8. [수정] ReviewCard에 toiletId를 전달 (좋아요 기능 때문) */}
          {/* 🚨 [수정] toilet이 null일 수도 있으므로 toilet?.id로 안전하게 접근 */}
          <ReviewCard reviews={currentReviews} toiletId={toilet?.id} showPhotos={isPhotoSectionOpen} />
        </div>

        {/* 10. 페이지네이션 컨트롤 */}
        <div className="pagination">
          <button
            onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            {"<<"}
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageClick(number)}
              // 현재 페이지에 'active' 클래스 부여
              className={currentPage === number ? "active" : ""}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() =>
              handlePageClick(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
}