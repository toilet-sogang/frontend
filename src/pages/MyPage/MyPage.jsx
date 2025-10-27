import "./MyPage.css"
import crown from "../../assets/MyPage/crown.svg"
import rename from "../../assets/MyPage/rename.svg"
import star_yell from "../../assets/star/star-yell.svg"
import star_grey from "../../assets/star/star-grey.svg"
import paper from "../../assets/MyPage/paper.svg"
import { useNavigate } from "react-router-dom";
import ChangeName from "./ChangeName"

import TopHeader from '../../components/layout/TopHeader.jsx'

export default function MyPage() {
  const nav = useNavigate();
  // ✅ ReviewCard.jsx에서 복사: 태그 한글 매핑
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

  // ✅ ReviewCard.jsx에서 복사: 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const res1 = {
    "success": true,
    "code": 200,
    "message": "내 정보 조회 성공",
    "data": {
      "name": "김도영",
      "profile": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ20mlA7nl2LGw9OZ3osAMsbKTZ30IvyijtXw&s", // 생략
      "rate": 15,
      "numReview": 3
    }
  }

  const res2 = {
  "success": true,
  "code": 200,
  "message": "리뷰 목록을 성공적으로 조회했습니다.",
  "data": [
    {
      "id": 101,
      "name": "홍대",
      "gender": "FEMALE",
      "line": 2,
      "desc": "깔끔하고 휴지가 넉넉했어요.",
      "star": 4,
      "photo": [
         "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ20mlA7nl2LGw9OZ3osAMsbKTZ30IvyijtXw&s",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ20mlA7nl2LGw9OZ3osAMsbKTZ30IvyijtXw&s"
      ],
      "tag": ["TOILET_CLEAN", "BRIGHT_LIGHTING"],
      "createdAt": "2025-09-30T10:00:00",
      "updatedAt": "2025-09-30T11:00:00"
    },
    {
      "id": 99,
      "name": "신촌(지하)",
      "gender": "MALE",
      "line": 2,
      "desc": "조금 좁지만 관리가 잘 되어 있습니다.",
      "star": 5,
      "photo": [],
      "tag": ["GOOD_VENTILATION"],
      "createdAt": "2025-09-28T09:00:00",
      "updatedAt": "2025-09-28T09:00:00"
    }
  ]
}



  const { name, profile, rate, numReview } = res1.data
  const reviews = res2.data

  // 별점 렌더링 함수
  const renderStars = (star) => {
    return (
      <div className="star-container">
        {[...Array(5)].map((_, i) => (
          <img
            key={i}
            src={i < star ? star_yell : star_grey}
            alt="star"
            className="star-icon"
            width="17px" // ✅ ReviewCard.jsx의 별 크기 적용
          />
        ))}
      </div>
    )
  }

  return (
    <div className="my-page">
      <TopHeader />
      <div className="profileContainer">
        <div className="profile-top">
          <img className="my-profile" src={profile} alt="profile" />
          <div className="sub-con">
            <div className="my-rate">
              <img src={crown} alt="crown" />
              <p>상위 {rate}%</p>
            </div>
            <div className="my-name">
              <p>{name}</p>
              <img src={rename} alt="rename" onClick={()=>{nav("/ChangeName")}}/>
            </div>
          </div>
        </div>

        <div className="profile-bottom">
          {name}님, 총 <span>{numReview}</span>개의 리뷰를 작성하셨네요!
        </div>
      </div>

      <div className="line"></div>

      <div className="my-review">
        <div className="review-header">내가 쓴 리뷰</div>

        <div className="ad">광고배너</div> {/* 광고 넣는 곳 */}

        <div className="reviews">

          {reviews.map((review) => {
            // ✅ ReviewCard.jsx의 날짜 포맷 로직 적용
            const isUpdated = review.createdAt !== review.updatedAt;
            const displayDate = isUpdated
              ? `${formatDate(review.updatedAt)} (수정)`
              : formatDate(review.createdAt);

            return (
            <div key={review.id} className="review-item">

              <div className="review-header">
                <h3><img src={paper} alt="" />{review.name}</h3>
                
                <p>{review.line}호선&nbsp;· {review.gender=="FEMALE"? <p className="fe">&nbsp;여자</p>:<p className="ma">&nbsp;남자</p>}</p>

                <p className="review-date">{displayDate} {/* ✅ 포맷된 날짜 적용 */} </p>

        

              </div>

              <div className="stars">{renderStars(review.star)}</div>

              <div className="review-desc">{review.desc}</div>

              {review.photo.length > 0 && (
                <div className="review-photos">
                  {review.photo.map((url, index) => (
                    <img key={index} src={url} alt={`review-${index}`} />
                  ))}
                </div>
              )}

              <div className="review-tags">
                {review.tag.map((t, index) => (
                  <span key={index} className="tag">
                    {tagMap[t] || t} {/* ✅ 한글 태그 매핑 적용 */}
                  </span>
                ))}
              </div>
              <div className="options">
                <div className="edit">수정하기</div>
                  <div className="del">삭제하기</div>
                </div>


            </div>
          )})}
        </div>
      </div>
    </div>
  )
}