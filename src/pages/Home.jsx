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

        <div className={`${styles.mapItem} ${styles.disabled}`}>
          <div className={styles.mapInfo}>
            <h2>맛집지도</h2>
            <p>준비 중</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
