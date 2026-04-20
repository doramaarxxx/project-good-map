import { Link } from 'react-router-dom'
import styles from './Home.module.css'

function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>한국 지도 모음</h1>

      <div className={styles.mapList}>
        <Link to="/cherry-blossom" className={styles.mapItem}>
          <div className={styles.mapInfo}>
            <h2>벚꽃지도</h2>
            <p>전국 벚꽃 명소 35곳</p>
          </div>
        </Link>

        <Link to="/local-restaurants" className={styles.mapItem}>
          <div className={styles.mapInfo}>
            <h2>지역 맛집</h2>
            <p>전국 맛집 모음</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Home
