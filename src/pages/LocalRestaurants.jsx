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
  const [currentRegion] = useState('성동구')
  const [activeInfoWindow, setActiveInfoWindow] = useState(null)

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
          center: new kakao.maps.LatLng(37.545, 127.043),
          level: 5
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
    const ps = new kakao.maps.services.Places()

    spots.forEach(spot => {
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
  }, [map, isMapReady, spots])

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

  const filteredSpots = spots.filter(spot => spot.district === currentRegion)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backBtn}>Back</Link>
        <h1>지역 맛집</h1>
        <span className={styles.count}>{filteredSpots.length}곳</span>
      </header>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.regionInfo}>
            <span className={styles.regionLabel}>내 지역</span>
            <span className={styles.regionName}>{currentRegion}</span>
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
    </div>
  )
}

export default LocalRestaurants
