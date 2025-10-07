import heart from '../../assets/heart.svg';
import star_yell from '../../assets/star/star-yell.svg';
import star_grey from '../../assets/star/star-grey.svg';

import './ReviewCard.css';

export default function ReviewCard({ reviews }) {
  // 영어 태그 → 한글 매핑
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

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  return (
    <div className="review-con">
      {reviews.map((review) => {
        const isUpdated = review.createdAt !== review.updatedAt;
        const displayDate = isUpdated
          ? `${formatDate(review.updatedAt)} (수정)`
          : formatDate(review.createdAt);

        return (
          <div key={review.id} className="review-card">
            <div className="contents">
              <div className="top">
                <div className="frofile-img"></div>

                <div className="info">
                  <div className="info2">
                    <p className="name">{review.userName}</p>
                    <p className="date">{displayDate}</p>
                  </div>

                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <img
                        key={i}
                        src={i < review.star ? star_yell : star_grey}
                        alt={i < review.star ? "yellow star" : "grey star"}
                        width="12px"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="desc">{review.description}</p>

              {review.tag && review.tag.length > 0 && (
                <div className="tags">
                  {review.tag.map((tag, index) => (
                    <div key={index} className="tag-item">
                      {tagMap[tag] || tag} {/* 매핑된 한글 표시, 없으면 원래 값 */}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="like">
              <div className="sub-like">
                <img src={heart} alt="like" />
                <p>{review.good}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
