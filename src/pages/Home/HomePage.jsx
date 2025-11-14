import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

import searchIcon from '../../assets/searchbar.svg';
import TopHeader from '../../components/layout/TopHeader';

import adbanner from "../../assets/ReviewPage/ad_Rectangle.svg";

const MOCK_SEARCH_RESULTS = [
  { id: 1, name: '신촌(지하)', line: 2, gender: 'M', star: 3.9, numReview: 5 },
  { id: 2, name: '신촌(지하)', line: 2, gender: 'F', star: 4.2, numReview: 12 },
  { id: 3, name: '이대', line: 2, gender: 'F', star: 4.5, numReview: 10 }
];

const FALLBACK_NEARBY_STATIONS = [
  { id: 1, name: "신촌(지하)" },
  { id: 2, name: "홍대입구" },
  { id: 3, name: "이대" },
];

function HomePage() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_APP_BACKEND_URL;
  const BACKEND_ON = true; 

  const [searchTerm, setSearchTerm] = useState(''); 
  const [debouncedTerm, setDebouncedTerm] = useState(''); 
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false); 
  
  const [nearbyStations, setNearbyStations] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(true);
  
  const [nearbyError, setNearbyError] = useState(null);
  const [searchError, setSearchError] = useState(null);

  // --- '가까운 역' API 호출 (useEffect) ---
  useEffect(() => {
    const fetchNearbyStations = async (latitude, longitude) => {
      setIsLoadingNearby(true);
      setNearbyError(null);

      if (!BACKEND_ON) {
        setNearbyStations(FALLBACK_NEARBY_STATIONS);
        setIsLoadingNearby(false);
        return;
      }

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setNearbyError('로그인이 필요합니다.(더미데이터를 표시합니다.)');
        setNearbyStations(FALLBACK_NEARBY_STATIONS);
        setIsLoadingNearby(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/station/suggest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ latitude, longitude }),
        });
        if (!response.ok) throw new Error('서버에서 데이터를 가져오는 데 실패했습니다.');
        
        const result = await response.json();
        
        if (result.success) {
          // 🚨 [수정] Array.isArray()로 `result.data.stations` (객체 안의 배열)이 배열인지 명확히 확인
          if (Array.isArray(result.data.stations)) {
            const transformedData = result.data.stations.map((stationName, index) => ({
              id: index,
              name: stationName,
            }));
            setNearbyStations(transformedData);
          } else {
            // API가 성공(success:true)했지만 data.stations가 배열이 아닌 경우 (null, {} 등)
            console.warn("API Error (Nearby): `result.data.stations` is not an array.", result.data);
            setNearbyStations([]); // 빈 배열로 설정하여 오류 방지
          }
        } else {
          throw new Error(result.message || '가까운 역 목록을 불러오지 못했습니다.');
        }
      } catch (err) {
        console.error("API Error (Nearby):", err.message);
        setNearbyError('데이터를 불러오지 못했습니다. (더미 데이터를 표시합니다.)');
        setNearbyStations(FALLBACK_NEARBY_STATIONS);
      } finally {
        setIsLoadingNearby(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchNearbyStations(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error("Geolocation error: ", err.message);
          setNearbyError('위치 정보를 가져올 수 없습니다. 기본 위치로 검색합니다.');
          fetchNearbyStations(37.4979, 127.0276);
        }
      );
    } else {
      setNearbyError('이 브라우저에서는 위치 정보를 지원하지 않습니다. 기본 위치로 검색합니다.');
      fetchNearbyStations(37.4979, 127.0276);
    }
  }, [API_URL, BACKEND_ON]);

  // --- 검색어 디바운싱 Effect ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500); 
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // --- 검색 API 호출 Effect ---
  useEffect(() => {
    const fetchSearchResults = async (query) => {
      setIsSearching(true);
      setSearchError(null); 

      if (!BACKEND_ON) {
        const filteredResults = MOCK_SEARCH_RESULTS.filter((station) =>
          station.name.includes(query)
        );
        setSearchResults(filteredResults);
        setIsSearching(false);
        return;
      }

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setSearchError('검색을 위해 로그인이 필요합니다.');
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/station/search?q=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errResult = await response.json(); 
          throw new Error(errResult.message || '검색 중 오류가 발생했습니다.');
        }

        const result = await response.json();

        if (result.success) {
          // 🚨 [수정] Array.isArray()로 `result.data`가 배열인지 명확히 확인
          if (Array.isArray(result.data)) {
            setSearchResults(result.data);
          } else {
            // API가 성공(success:true)했지만 data가 배열이 아닌 경우 (null, {} 등)
            console.warn("API Error (Search): `result.data` is not an array.", result.data);
            setSearchResults([]); // 빈 배열로 설정
          }
        } else {
          throw new Error(result.message || '검색 결과를 불러오지 못했습니다.');
        }
      } catch (err) {
        console.error("Search API Error:", err.message);
        setSearchError(err.message); 
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    if (debouncedTerm.trim() !== '') {
      fetchSearchResults(debouncedTerm);
    } else {
      setSearchResults([]); 
    }
  }, [debouncedTerm, API_URL, BACKEND_ON]); 

  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const renderStars = (startCount) => {
    const roundedStars = Math.round(startCount);
    return '⭐'.repeat(roundedStars);
  };

  const openNaverMap = () => {
    window.open('https://map.naver.com/', '_blank');
  };

  const goToDetailPage = (toiletId) => {
    navigate(`/toilet/${toiletId}`);
  };

  const handleNearbyClick = (stationName) => {
    setSearchTerm(stationName);
  };


  return (
    <div className="Home-page">
      <TopHeader />
      <div className="home-container">
        
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

          {/* --- 검색 결과창 --- */}
          {searchTerm.trim() !== '' && (
            <ul className="search-results">
              {isSearching && <li className="result-item-info">검색 중...</li>}
              
              {!isSearching && searchError && (
                <li className="result-item-info" style={{ color: 'red' }}>{searchError}</li>
              )}

              {/* [수정] searchResults가 확실히 배열이므로 .length 오류 없음 */}
              {!isSearching && !searchError && searchResults.length === 0 && (
                <li className="result-item-info">검색 결과가 없습니다.</li>
              )}

              {!isSearching && searchResults.map((result) => (
                <li key={result.id} className="result-item" onClick={() => goToDetailPage(result.id)}>
                  <span className="result-name">{result.name}</span>
                  <div className="result-details">
                    <span className="result-info">
                      {result.line}호선 · 
                      <span className={result.gender === 'M' ? 'gender-male' : 'gender-female'}>
                        {result.gender === 'M' ? '남자' : '여자'}
                      </span>
                    </span>
                    <span className="result-star-icons">{renderStars(result.star)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div> 

        <section className="map-link-section">
          <h3>혹시 이 역을 찾고 계시나요?</h3>
          <button className="map-link-button" onClick={openNaverMap}>
            네이버지도 앱으로 보기
          </button>
        </section>

        {/* --- '가까운 역' 섹션 --- */}
        <section className="nearby-stations-section">
          {nearbyError && (
            <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>
              {nearbyError}
            </p>
          )}
          <ul className="nearby-stations-list">
            {isLoadingNearby && <li>가까운 역을 불러오는 중...</li>}
            
            {/* [수정] nearbyStations가 확실히 배열이므로 .length 오류 없음 */}
            {!isLoadingNearby && nearbyStations.length > 0 && nearbyStations.map((station) => (
              <li
                key={station.id}
                className="station-item"
                onClick={() => handleNearbyClick(station.name)}
                style={{ cursor: 'pointer' }}
              >
                <span className="station-item-name">{station.name}</span>
              </li>
            ))}
            
            {!isLoadingNearby && !nearbyError && nearbyStations.length === 0 && (
              <li>주변에 등록된 역이 없습니다.</li>
            )}
          </ul>
        </section>

        <footer className="ad-banner">
          <img src={adbanner} alt="광고" className="prdp-ad-image" />
        </footer>
        
      </div>
    </div>
  );
}

export default HomePage;