import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getCherryBlossomSpots } from '../services/supabase'
import styles from './CherryBlossomMap.module.css'

function CherryBlossomMap() {
  const mapRef = useRef(null)
  const [spots, setSpots] = useState([])
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [map, setMap] = useState(null)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    getCherryBlossomSpots().then(data => {
      console.log('Spots loaded:', data)
      setSpots(data)
    })
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        console.log('Kakao Maps not loaded yet')
        setTimeout(initMap, 100)
        return
      }

      const { kakao } = window

      kakao.maps.load(() => {
        console.log('Kakao Maps initialized')
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

    console.log('Adding markers:', spots.length)
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backBtn}>Back</Link>
        <h1>벚꽃지도</h1>
        <span className={styles.count}>{spots.length}곳</span>
      </header>

      <div ref={mapRef} className={styles.map} />

      {selectedSpot && (
        <div className={styles.spotDetail}>
          <button className={styles.closeBtn} onClick={() => setSelectedSpot(null)}>X</button>
          <h2>{selectedSpot.name}</h2>
          <p className={styles.address}>{selectedSpot.address}</p>
          <p className={styles.region}>{selectedSpot.region} {selectedSpot.district}</p>
          {selectedSpot.bloom_period && (
            <p className={styles.bloom}>개화시기: {selectedSpot.bloom_period}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default CherryBlossomMap
