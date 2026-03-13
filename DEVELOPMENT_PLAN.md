# 벚꽃지도 프로젝트 개발 계획서

## 1. 프로젝트 개요

한국 벚꽃 명소를 지도에 핀으로 표시하는 React 웹 애플리케이션

### 주요 기능
- 인덱스 페이지: 지도 목록 (벚꽃지도, 맛집지도)
- 벚꽃지도 페이지: 한국 지도 + 벚꽃 명소 핀 표시
- 핀 클릭 시 상세 정보 표시

---

## 2. 수집된 데이터 현황

### 2.1 출처별 데이터

| 출처 | 수집 건수 | 주소 유무 | 좌표 유무 |
|------|----------|----------|----------|
| wegive.co.kr | 20개 | X | X |
| seoul.go.kr | 100+개 | O | X |
| visitkorea.or.kr | 4개 | O | X |

### 2.2 수집된 명소 목록

#### 전국 명소 (wegive.co.kr)
| 지역 | 명소명 |
|------|--------|
| 전라도 | 담양 관방제림 |
| 전라도 | 곡성 섬진강 벚꽃길 |
| 전라도 | 고흥 나로호로 |
| 전라도 | 영암 왕인박사유적지 |
| 전라도 | 여수 승월마을 |
| 전라도 | 해남 대흥사 |
| 충청권 | 논산 관촉사 |
| 충청권 | 보령 주산 벚꽃길 |
| 충청권 | 부여 구드래나루터 |
| 충청권 | 태안 해안도로 |
| 충청권 | 홍성 홍주읍성 |
| 충청권 | 영동 용두공원 |
| 강원권 | 영월 동강둔치 |
| 강원권 | 인제 소양강변 |
| 강원권 | 양구 파로호 |
| 강원권 | 고성 화진포 |
| 경상권 | 영덕 창포리 |
| 경상권 | 영주 서천둔치 |
| 경상권 | 김해 연지공원 |
| 경상권 | 남해 왕지마을 |

#### 서울 명소 (seoul.go.kr)
| 구 | 명소명 | 주소 |
|---|--------|------|
| 강남구 | 개포로 | 서울시 강남구 일원로 7 |
| 강남구 | 양재천 제방 | 서울시 강남구 |
| 노원구 | 불암산 스타디움 근처 | 서울시 노원구 노원로 186-10 |
| 노원구 | 우이천변 | 서울시 노원구 월계로45길 92 |
| 동대문구 | 경희대학교 | 서울시 동대문구 경희대로 24 |
| 동작구 | 현충로 현충원내 | 서울시 동작구 현충로 210 |
| 마포구 | 토정로 | 서울시 마포구 독막로8길 49 |
| 마포구 | 경의선숲길 | 서울시 마포구 백범로36길 8-7 |
| 서대문구 | 연세로 명물거리 | 서울시 서대문구 신촌로 99 |
| 서대문구 | 안산도시자연공원 | 서울시 서대문구 연희로32길 134 |
| 송파구 | 송파나루공원(석촌호수) | 서울시 송파구 석촌호수로 188 |
| 중구 | 남산공원 순환로 | 서울시 중구 남산공원길 507 |

#### 전국 주요 명소 (visitkorea.or.kr)
| 지역 | 명소명 | 주소 |
|------|--------|------|
| 경북 | 경주 대릉원 | 경상북도 경주시 황남동 31-1 |
| 강원 | 강릉 경포생태저류지 | 강원특별자치도 강릉시 죽헌동 745 |
| 충남 | 공주 충청남도역사박물관 | 충청남도 공주시 국고개길 24 |
| 전남 | 여수 승월마을 | 전라남도 여수시 돌산읍 승월길 64 |

---

## 3. 기술 스택

### Frontend
- **Framework**: React 18+
- **Routing**: React Router v6
- **지도 라이브러리**:
  - Option 1: Kakao Maps SDK (추천 - 한국 지도에 최적화)
  - Option 2: Naver Maps API
  - Option 3: React-Leaflet + OpenStreetMap
- **스타일링**: CSS Modules 또는 Tailwind CSS
- **상태관리**: React Query (서버 상태) + useState (로컬 상태)

### Backend / Database
- **Database**: Supabase (PostgreSQL)
- **인증**: Supabase Auth (추후 필요시)

### 개발 도구
- **빌드**: Vite
- **패키지 매니저**: npm 또는 yarn

---

## 4. Supabase 데이터베이스 스키마

### 4.1 테이블 설계

```sql
-- 벚꽃 명소 테이블
CREATE TABLE cherry_blossom_spots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,           -- 명소 이름
  address VARCHAR(255),                  -- 주소
  region VARCHAR(50),                    -- 지역 (서울, 경기, 강원 등)
  district VARCHAR(50),                  -- 세부 지역 (강남구, 춘천시 등)
  latitude DECIMAL(10, 8),               -- 위도
  longitude DECIMAL(11, 8),              -- 경도
  description TEXT,                      -- 설명
  bloom_period VARCHAR(50),              -- 개화 시기 (예: "4월 초~중순")
  source VARCHAR(100),                   -- 데이터 출처
  image_url VARCHAR(500),                -- 이미지 URL (선택)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_spots_region ON cherry_blossom_spots(region);
CREATE INDEX idx_spots_coordinates ON cherry_blossom_spots(latitude, longitude);
```

### 4.2 좌표 변환 방안

주소 → 좌표 변환을 위해 다음 API 중 선택:

| API | 무료 한도 | 특징 |
|-----|----------|------|
| Kakao Local API | 100,000건/일 | 한국 주소 정확도 높음 |
| Naver Maps API | 무료 한도 있음 | 네이버 지도 연동시 유리 |
| Google Geocoding API | $200 무료 크레딧 | 글로벌 지원 |

**권장**: Kakao Local API 사용 (무료 한도 충분, 한국 주소 특화)

---

## 5. 프로젝트 구조

```
project-good-map/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── Header.jsx
│   │   └── map/
│   │       ├── KoreaMap.jsx        # 지도 컴포넌트
│   │       ├── MapPin.jsx          # 핀 컴포넌트
│   │       └── SpotDetail.jsx      # 상세 정보 팝업
│   ├── pages/
│   │   ├── Home.jsx                # 인덱스 페이지 (지도 목록)
│   │   ├── CherryBlossomMap.jsx    # 벚꽃지도 페이지
│   │   └── FoodMap.jsx             # 맛집지도 페이지 (추후)
│   ├── services/
│   │   └── supabase.js             # Supabase 클라이언트
│   ├── hooks/
│   │   └── useSpots.js             # 명소 데이터 커스텀 훅
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── .env                             # 환경변수 (Supabase, Map API 키)
├── package.json
└── vite.config.js
```

---

## 6. 페이지 설계

### 6.1 Home 페이지 (인덱스)

```
┌─────────────────────────────────┐
│         한국 지도 모음           │
├─────────────────────────────────┤
│                                 │
│   🌸 벚꽃지도                    │
│   └─ 전국 벚꽃 명소              │
│                                 │
│   🍜 맛집지도                    │
│   └─ 준비 중                     │
│                                 │
└─────────────────────────────────┘
```

### 6.2 벚꽃지도 페이지

```
┌─────────────────────────────────┐
│  ← 뒤로   벚꽃지도               │
├─────────────────────────────────┤
│                                 │
│     ┌─────────────────────┐     │
│     │    [한국 지도]       │     │
│     │                     │     │
│     │   📍 📍             │     │
│     │      📍    📍       │     │
│     │   📍    📍   📍     │     │
│     │      📍    📍       │     │
│     │         📍          │     │
│     └─────────────────────┘     │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 경주 대릉원              │    │
│  │ 경상북도 경주시 황남동    │    │
│  │ 개화시기: 4월 초~중순     │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

---

## 7. 라우팅 구조

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | Home | 지도 목록 |
| `/cherry-blossom` | CherryBlossomMap | 벚꽃지도 |
| `/food` | FoodMap | 맛집지도 (추후) |

---

## 8. 개발 단계

### Phase 1: 프로젝트 셋업
- [ ] Vite + React 프로젝트 생성
- [ ] React Router 설정
- [ ] Supabase 프로젝트 생성 및 연동
- [ ] 환경변수 설정

### Phase 2: 데이터베이스 구축
- [ ] Supabase 테이블 생성
- [ ] Kakao Local API로 주소 → 좌표 변환 스크립트 작성
- [ ] 수집된 명소 데이터 DB 입력

### Phase 3: 기본 UI 구현
- [ ] Home 페이지 (지도 목록)
- [ ] 공통 Header 컴포넌트
- [ ] 기본 스타일링

### Phase 4: 지도 구현
- [ ] Kakao Maps SDK 연동
- [ ] KoreaMap 컴포넌트 구현
- [ ] MapPin 컴포넌트 구현
- [ ] Supabase에서 데이터 fetch

### Phase 5: 상세 기능
- [ ] 핀 클릭 시 상세 정보 표시
- [ ] 지역별 필터링 (선택)
- [ ] 반응형 디자인

---

## 9. 필요한 API 키

| 서비스 | 용도 | 발급처 |
|--------|------|--------|
| Supabase | 데이터베이스 | https://supabase.com |
| Kakao Maps | 지도 표시 | https://developers.kakao.com |
| Kakao Local API | 주소→좌표 변환 | https://developers.kakao.com |

---

## 10. 다음 단계

1. **Supabase 프로젝트 생성**
   - 프로젝트 생성 후 URL과 anon key 확보

2. **Kakao Developers 앱 등록**
   - JavaScript 키 발급
   - REST API 키 발급 (Geocoding용)

3. **좌표 변환 스크립트 실행**
   - 수집된 주소를 좌표로 변환
   - Supabase에 데이터 입력

4. **React 프로젝트 개발 시작**

---

## 부록: 예상 일정

> 사용자가 결정

---

*작성일: 2026-03-13*
