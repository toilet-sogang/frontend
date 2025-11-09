import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// [수정] ReviewCard 임포트가 더 이상 필요 없습니다 (필요시 제거)
// import ReviewCard from "../../components/review/ReviewCard";
import TopHeader from "../../components/layout/TopHeader";
// [수정] 새 CSS 파일 임포트
import "./PhotoReviewsPage.css"; 

// [수정] 한 페이지에 보여줄 '사진' 개수 (4열 * 3줄 = 12개)
const PHOTOS_PER_PAGE = 12;

// [수정] 컴포넌트 이름 변경
export default function PhotoReviewsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { reviews, toilet } = location.state || {};
  const [currentPage, setCurrentPage] = useState(1);

  // 데이터 유효성 검사 (변경 없음)
  useEffect(() => {
    if (!reviews || !toilet) {
      alert("잘못된 접근입니다. 리뷰 정보를 불러올 수 없습니다.");
      navigate(-1);
    }
  }, [reviews, toilet, navigate]);

  // 로딩 UI (변경 없음)
  if (!reviews || !toilet) {
    return (
      <div className="photo-reviews-page">
        <TopHeader />
        <p style={{ padding: "20px", textAlign: "center" }}>
          리뷰 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  // --- [수정] 페이지네이션 로직 (변수 이름 변경) ---
  const indexOfLastPhoto = currentPage * PHOTOS_PER_PAGE;
  const indexOfFirstPhoto = indexOfLastPhoto - PHOTOS_PER_PAGE;
  // [수정]
  const currentPhotos = reviews.slice(indexOfFirstPhoto, indexOfLastPhoto);

  const totalPages = Math.ceil(reviews.length / PHOTOS_PER_PAGE);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  // --- 로직 끝 ---

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); 
  };

  return (
    // [수정] 클래스 이름 변경
    <div className="photo-reviews-page">
      <TopHeader />
      {/* [수정] 클래스 이름 변경 */}
      <div className="photo-reviews-container">
        
        {/* [수정] 클래스 이름 변경 */}
        <div className="photo-reviews-header">
          <div className="photo-reviews-header-info">
            <h3>{toilet.name}</h3>
            <p>
              {toilet.line}호선
              <span className="er-review-info-divider">·</span>
              {toilet.gender === "FEMALE" || toilet.gender === "F" ? (
                <span className="fe" style={{ color: "#E13A6E" }}>여자</span>
              ) : (
                <span className="ma" style={{ color: "#0D6EFD" }}>남자</span>
              )}
            </p>
          </div>
          {/* [수정] 텍스트 및 클래스 이름 변경 */}
          <span className="photo-review-count">포토리뷰 ({reviews.length})</span>
        </div>

        {/* 필터 (동일하게 유지) */}
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

        {/* [수정] --- 리뷰 카드 목록 대신 포토 그리드 --- */}
        <div className="photo-grid-list">
          {/* currentPhotos 배열을 map으로 돌립니다.
            review 객체에는 photo: ["url1", "url2"]가 들어있습니다.
            지금은 '빈칸'으로 대체하므로 review.photo[0] (첫번째 사진)을 
            실제로 사용하진 않지만, key와 onClick은 review 데이터를 사용합니다.
          */}
          {currentPhotos.map((review) => (
            <button
              key={review.id}
              className="photo-grid-item" // 이 클래스가 '빈칸' 스타일을 가집니다.
              onClick={() => 
                // [수정] PhotoReviewDetailPage로 이동 (review.id 전달)
                navigate(`/photo-review/${review.id}`, { 
                  state: { review: review, toilet: toilet } 
                })
              }
            >
              {/* 실제 사진을 넣으려면 여기에 img 태그를 넣습니다:
                <img src={review.photo[0]} alt="포토리뷰" />
                지금은 '빈칸' 스타일을 .photo-grid-item에 CSS로 적용합니다.
              */}
            </button>
          ))}
        </div>
        {/* --- 그리드 끝 --- */}


        {/* 페이지네이션 컨트롤 (변경 없음) */}
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