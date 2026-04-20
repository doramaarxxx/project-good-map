import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getLocalRestaurants } from '../services/supabase'
import styles from './LocalRestaurants.module.css'

// 서울 구 목록
const SEOUL_DISTRICTS = [
  '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
  '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
  '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
]

// 서울 구별 대략적인 중심 좌표
const DISTRICT_CENTERS = {
  '강남구': { lat: 37.5172, lng: 127.0473 },
  '강동구': { lat: 37.5301, lng: 127.1238 },
  '강북구': { lat: 37.6396, lng: 127.0255 },
  '강서구': { lat: 37.5509, lng: 126.8495 },
  '관악구': { lat: 37.4784, lng: 126.9516 },
  '광진구': { lat: 37.5385, lng: 127.0823 },
  '구로구': { lat: 37.4954, lng: 126.8874 },
  '금천구': { lat: 37.4519, lng: 126.9020 },
  '노원구': { lat: 37.6542, lng: 127.0568 },
  '도봉구': { lat: 37.6688, lng: 127.0471 },
  '동대문구': { lat: 37.5744, lng: 127.0400 },
  '동작구': { lat: 37.5124, lng: 126.9393 },
  '마포구': { lat: 37.5663, lng: 126.9014 },
  '서대문구': { lat: 37.5791, lng: 126.9368 },
  '서초구': { lat: 37.4837, lng: 127.0324 },
  '성동구': { lat: 37.5633, lng: 127.0371 },
  '성북구': { lat: 37.5894, lng: 127.0167 },
  '송파구': { lat: 37.5145, lng: 127.1050 },
  '양천구': { lat: 37.5270, lng: 126.8561 },
  '영등포구': { lat: 37.5264, lng: 126.8963 },
  '용산구': { lat: 37.5324, lng: 126.9906 },
  '은평구': { lat: 37.6027, lng: 126.9291 },
  '종로구': { lat: 37.5735, lng: 126.9790 },
  '중구': { lat: 37.5641, lng: 126.9979 },
  '중랑구': { lat: 37.6063, lng: 127.0925 }
}

function LocalRestaurants() {
  const mapRef = useRef(null)
  const [spots, setSpots] = useState([])
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [map, setMap] = useState(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [selectedRegions, setSelectedRegions] = useState(['성동구'])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeInfoWindow, setActiveInfoWindow] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(5)
  const [districtOverlays, setDistrictOverlays] = useState([])
  const dropdownRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    getLocalRestaurants().then(setSpots)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        setTimeout(initMap, 100)
        return
      }

      const { kakao } = window

      kakao.maps.load(() => {
        const mapInstance = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(37.545, 127.043),
          level: 5
        })
        setMap(mapInstance)
        setIsMapReady(true)

        kakao.maps.event.addListener(mapInstance, 'zoom_changed', () => {
          const level = mapInstance.getLevel()
          setZoomLevel(level)
        })
      })
    }

    initMap()
  }, [])

  // 구 오버레이 표시
  useEffect(() => {
    if (!map || !isMapReady || !window.kakao) return

    const { kakao } = window

    // 기존 오버레이 제거
    districtOverlays.forEach(overlay => overlay.setMap(null))

    const newOverlays = []

    // 줌 레벨 8 이상이면 모든 구 표시, 아니면 선택된 구만 표시
    const districtsToShow = zoomLevel >= 8 ? SEOUL_DISTRICTS : selectedRegions

    districtsToShow.forEach(district => {
      const center = DISTRICT_CENTERS[district]
      if (!center) return

      const content = document.createElement('div')
      content.className = styles.districtMarker
      content.innerHTML = district
      content.dataset.district = district

      if (selectedRegions.includes(district)) {
        content.classList.add(styles.districtMarkerSelected)
      }

      content.addEventListener('mouseenter', () => {
        if (!selectedRegions.includes(district)) {
          content.classList.add(styles.districtMarkerHover)
        }
      })

      content.addEventListener('mouseleave', () => {
        content.classList.remove(styles.districtMarkerHover)
      })

      content.addEventListener('click', () => {
        toggleRegion(district)
      })

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(center.lat, center.lng),
        content: content,
        yAnchor: 0.5,
        xAnchor: 0.5
      })

      overlay.setMap(map)
      newOverlays.push(overlay)
    })

    setDistrictOverlays(newOverlays)
  }, [map, isMapReady, zoomLevel, selectedRegions])

  // 마커 표시
  useEffect(() => {
    if (!map || !isMapReady || spots.length === 0 || !window.kakao) return

    const { kakao } = window
    const ps = new kakao.maps.services.Places()

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    const filteredSpots = spots.filter(spot => selectedRegions.includes(spot.district))

    filteredSpots.forEach(spot => {
      const keyword = `${spot.district} ${spot.name}`

      ps.keywordSearch(keyword, (data, status) => {
        let position

        if (status === kakao.maps.services.Status.OK && data.length > 0) {
          position = new kakao.maps.LatLng(data[0].y, data[0].x)
        } else {
          position = new kakao.maps.LatLng(spot.latitude, spot.longitude)
        }

        const marker = new kakao.maps.Marker({
          map: map,
          position: position,
          title: spot.name
        })

        markersRef.current.push(marker)

        const infoWindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:8px 12px;font-size:13px;font-weight:500;white-space:nowrap;">${spot.name}</div>`
        })

        kakao.maps.event.addListener(marker, 'click', () => {
          if (activeInfoWindow) {
            activeInfoWindow.close()
          }
          infoWindow.open(map, marker)
          setActiveInfoWindow(infoWindow)
          setSelectedSpot(spot)
          map.panTo(position)
        })
      })
    })
  }, [map, isMapReady, spots, selectedRegions])

  const toggleRegion = (district) => {
    setSelectedRegions(prev => {
      if (prev.includes(district)) {
        if (prev.length === 1) return prev // 최소 1개는 선택
        return prev.filter(r => r !== district)
      } else {
        return [...prev, district]
      }
    })
  }

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot)
    if (map && window.kakao) {
      const { kakao } = window
      const ps = new kakao.maps.services.Places()
      const keyword = `${spot.district} ${spot.name}`

      ps.keywordSearch(keyword, (data, status) => {
        if (status === kakao.maps.services.Status.OK && data.length > 0) {
          const position = new kakao.maps.LatLng(data[0].y, data[0].x)
          map.panTo(position)
        }
      })
    }
  }

  const closeDetail = () => {
    setSelectedSpot(null)
    if (activeInfoWindow) {
      activeInfoWindow.close()
      setActiveInfoWindow(null)
    }
  }

  const getSearchKeyword = (spot) => {
    return `${spot.district} ${spot.name}`
  }

  const getNaverMapUrl = (spot) => {
    return `https://map.naver.com/v5/search/${encodeURIComponent(getSearchKeyword(spot))}`
  }

  const getKakaoMapUrl = (spot) => {
    return `https://map.kakao.com/?q=${encodeURIComponent(getSearchKeyword(spot))}`
  }

  const getGoogleMapUrl = (spot) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getSearchKeyword(spot))}`
  }

  const filteredSpots = spots.filter(spot => selectedRegions.includes(spot.district))

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backBtn}>Back</Link>
        <h1>지역 맛집</h1>
        <span className={styles.count}>{filteredSpots.length}곳</span>
      </header>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.regionInfo} ref={dropdownRef}>
            <span className={styles.regionLabel}>내 지역</span>
            <button
              className={styles.regionSelector}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className={styles.regionName}>
                {selectedRegions.length === 1
                  ? selectedRegions[0]
                  : `${selectedRegions[0]} 외 ${selectedRegions.length - 1}곳`}
              </span>
              <span className={styles.dropdownArrow}>{isDropdownOpen ? '▲' : '▼'}</span>
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdown}>
                {SEOUL_DISTRICTS.map(district => (
                  <label key={district} className={styles.dropdownItem}>
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes(district)}
                      onChange={() => toggleRegion(district)}
                    />
                    <span>{district}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className={styles.spotList}>
            {filteredSpots.map(spot => (
              <div
                key={spot.id}
                className={`${styles.spotItem} ${selectedSpot?.id === spot.id ? styles.spotItemActive : ''}`}
                onClick={() => handleSpotClick(spot)}
              >
                <p className={styles.spotName}>{spot.name}</p>
                <p className={styles.spotCategory}>{spot.category}</p>
              </div>
            ))}
            {filteredSpots.length === 0 && (
              <div className={styles.emptyList}>
                <p>등록된 맛집이 없습니다</p>
              </div>
            )}
          </div>
        </aside>

        <div className={`${styles.detailPanel} ${selectedSpot ? styles.detailPanelOpen : ''}`}>
          {selectedSpot && (
            <>
              <button className={styles.closeBtn} onClick={closeDetail}>
                <span>&larr;</span>
              </button>

              <div className={styles.detailContent}>
                <h2>{selectedSpot.name}</h2>

                <div className={styles.section}>
                  <p className={styles.label}>주소</p>
                  <p className={styles.value}>{selectedSpot.address || '-'}</p>
                </div>

                <div className={styles.section}>
                  <p className={styles.label}>지역</p>
                  <p className={styles.value}>{selectedSpot.region} {selectedSpot.district}</p>
                </div>

                {selectedSpot.category && (
                  <div className={styles.section}>
                    <p className={styles.label}>카테고리</p>
                    <p className={styles.value}>{selectedSpot.category}</p>
                  </div>
                )}

                {selectedSpot.description && (
                  <div className={styles.section}>
                    <p className={styles.label}>설명</p>
                    <p className={styles.value}>{selectedSpot.description}</p>
                  </div>
                )}

                <div className={styles.links}>
                  <p className={styles.label}>지도에서 보기</p>
                  <div className={styles.linkButtons}>
                    <a href={getNaverMapUrl(selectedSpot)} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                      네이버지도
                    </a>
                    <a href={getKakaoMapUrl(selectedSpot)} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                      카카오맵
                    </a>
                    <a href={getGoogleMapUrl(selectedSpot)} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                      구글맵
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div ref={mapRef} className={styles.map} />
      </div>

      {zoomLevel >= 8 && (
        <div className={styles.zoomHint}>
          지도에서 구 이름을 클릭하면 내 지역에 추가됩니다
        </div>
      )}
    </div>
  )
}

export default LocalRestaurants
