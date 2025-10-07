import ReviewCard from "../../components/review/ReviewCard"



export default function HomePage() {
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

const reviews = response.data;


    return<div>HomePage
        <ReviewCard reviews={reviews}/>

    </div>
}