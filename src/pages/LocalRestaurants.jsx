import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getLocalRestaurants } from '../services/supabase'
import styles from './LocalRestaurants.module.css'

function LocalRestaurants() {
  const mapRef = useRef(null)
  const [spots, setSpots] = useState([])
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [map, setMap] = useState(null)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    getLocalRestaurants().then(setSpots)
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
          center: new kakao.maps.LatLng(36.5, 127.5),
          level: 13
        })
        setMap(mapInstance)
        setIsMapReady(true)
      })
    }

    initMap()
  }, [])

  useEffect(() => {
    if (!map || !isMapReady || spots.length === 0 || !window.kakao) return

    const { kakao } = window

    spots.forEach(spot => {
      const marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(spot.latitude, spot.longitude),
        title: spot.name
      })

      kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedSpot(spot)
        map.panTo(new kakao.maps.LatLng(spot.latitude, spot.longitude))
      })
    })
  }, [map, isMapReady, spots])

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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backBtn}>Back</Link>
        <h1>지역 맛집</h1>
        <span className={styles.count}>{spots.length}곳</span>
      </header>

      <div className={styles.content}>
        <aside className={`${styles.sidebar} ${selectedSpot ? styles.sidebarOpen : ''}`}>
          {selectedSpot ? (
            <div className={styles.spotDetail}>
              <button className={styles.closeBtn} onClick={() => setSelectedSpot(null)}>X</button>

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
          ) : (
            <div className={styles.placeholder}>
              <p>지도에서 핀을 클릭하면</p>
              <p>상세 정보가 표시됩니다</p>
            </div>
          )}
        </aside>

        <div ref={mapRef} className={styles.map} />
      </div>
    </div>
  )
}

export default LocalRestaurants
