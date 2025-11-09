import React, { useState, useEffect } from "react";
// 1. useLocation으로 state 데이터를 받고, useNavigate로 fallback 처리
import { useLocation, useNavigate } from "react-router-dom";
import ReviewCard from "../../components/review/ReviewCard";
import TopHeader from "../../components/layout/TopHeader";
import "./AllReviewsPage.css"; // 이 페이지를 위한 새 CSS 파일
import AdBannerSvg from "../../assets/ReviewPage/adRectangle.svg";

// 한 페이지에 보여줄 리뷰 개수
const REVIEWS_PER_PAGE = 5;

export default function AllReviewsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 2. ToiletDetailPage에서 state로 넘겨준 데이터 받기
  const { reviews, toilet } = location.state || {};

  // 3. 페이지네이션을 위한 현재 페이지 state (1페이지부터 시작)
  const [currentPage, setCurrentPage] = useState(1);

  // 4. [중요] 데이터가 없는 경우(직접 URL로 접근 등) 처리
  useEffect(() => {
    if (!reviews || !toilet) {
      alert("잘못된 접근입니다. 리뷰 정보를 불러올 수 없습니다.");
      // 이전 페이지로 돌려보내거나, toiletId가 있다면 API를 재요청
      navigate(-1); // 가장 간단하게는 뒤로가기
    }
  }, [reviews, toilet, navigate]);

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
  // .slice(시작, 끝)
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  // 7. 전체 페이지 수 계산
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

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
          <span className="review">리뷰 ({reviews.length})</span>
        </div>

        {/* [추가] 광고 배너 (리뷰 텍스트와 필터 사이에 배치) */}
        <div className="ad-banner-wrapper">
          <img src={AdBannerSvg} alt="광고 배너" className="ad-banner-image" />
        </div>

        {/* [추가] ToiletDetailPage에서 가져온 필터 섹션 */}
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

        {/* 9. ReviewCard에 '현재 페이지'의 리뷰 목록(currentReviews) 전달 */}
        <div className="review-card-list">
          <ReviewCard reviews={currentReviews} />
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