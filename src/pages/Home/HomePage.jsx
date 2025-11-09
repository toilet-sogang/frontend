import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

import searchIcon from '../../assets/searchbar.svg';
import TopHeader from '../../components/layout/TopHeader';

const DUMMY_STATION_DATA = [
  { id: 1, name: '신촌(지하)', line: '2호선', gender: '남자', stars: 5 },
  { id: 2, name: '신촌(지하)',  line: '2호선', gender: '여자',stars: 5 },
];

// 예시 데이터 (실제로는 props나 API 응답으로 받아야 함)
const nearbyStations = [
  { id: 1, name: "신촌(지하)" },
  { id: 2, name: "홍대입구" },
  { id: 3, name: "이대" },
];

function HomePage() {

  const navigate = useNavigate();

  // 3. 검색어와 검색 결과를 state로 관리
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // 4. 검색창 입력 시 호출될 함수
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    // 입력값이 '신촌'을 포함할 때만 더미데이터 필터링 (요청 사항)
    if (query.trim() !== '' && query.includes('신촌')) {
      const filteredResults = DUMMY_STATION_DATA.filter((station) =>
        station.name.includes(query)
      );
      setSearchResults(filteredResults);
    } else {
      // 그 외의 경우 (비어있거나 '신촌'이 아니면) 결과창 숨김
      setSearchResults([]);
    }
  };

  const renderStars = (startCount) => {
    return '⭐'. repeat(startCount);
  };
  
  // 네이버 지도로 이동하는 함수 (예시)
  const openNaverMap = () => {
    // 특정 좌표나 검색어로 네이버 지도 앱/웹을 여는 URL 스킴
    // 여기서는 예시로 네이버 지도 메인으로 연결합니다.
    window.open('https://map.naver.com/', '_blank');
  };

  const handleStationClick = (stationId) => {
    navigate(`/review/${stationId}`);
  };

  return (
    <div className="Home-page">
      <TopHeader />
    <div className="home-container">
      {/* 2. 검색 섹션: 검색창 + 검색 버튼 */}
      <div className="search-wrapper">
      <section className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="역 이름 검색하기"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="search-button">
          <img src={searchIcon} alt="검색" />
        </button>
      </section>
      {/* 6. 검색 결과 박스 (searchResults에 내용이 있을 때만 보임) */}
        {searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.map((result) => (
              <li key={result.id} className="result-item" onClick={() => handleStationClick(result.id)}>
                <span className="result-name">{result.name}</span>
                <div className="result-details">
                  <span className="result-info">
                    {result.line} · 
                    <span className={result.gender === '남자' ? 'gender-male' : 'gender-female'}>
                      {result.gender}
                    </span>
                  </span>
                <span className="result-star-icons">{renderStars(result.stars)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div> {/* .search-wrapper 끝 */}

      {/* 3. 네이버 지도로 찾기 */}
      <section className="map-link-section">
        <h3>혹시 이 역을 찾고 계시나요?</h3>
        <button className="map-link-button" onClick={openNaverMap}>
          네이버지도 앱으로 보기
        </button>
      </section>

      <section className="nearby-stations-section">
      <ul className="nearby-stations-list">
        {/* 4. 예시 데이터를 map()으로 반복 렌더링합니다. */}
        {nearbyStations.map((station) => (
          <li
            key={station.id}
            className="station-item"
            // 5. onClick 이벤트를 추가합니다.
            onClick={() => handleStationClick(station.id)}
            style={{ cursor: 'pointer' }} // 클릭 가능하게 마우스 커서 변경
          >
            <span className="station-item-name">{station.name}</span>
          </li>
        ))}
      </ul>
    </section>
  

      {/* 5. 광고 배너 */}
      <footer className="ad-banner">
        광고가 표시되는 영역입니다.
      </footer>
      
    </div>
  </div>
  );
}

export default HomePage;