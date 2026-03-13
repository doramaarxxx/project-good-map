/**
 * Supabase 테이블 생성 및 데이터 입력 스크립트
 * 실행: node scripts/setup-db.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// 수집된 벚꽃 명소 데이터
const spots = [
  // visitkorea.or.kr 데이터 (주소 있음)
  { name: '경주 대릉원', address: '경상북도 경주시 황남동 31-1', region: '경상북도', district: '경주시', source: 'visitkorea' },
  { name: '강릉 경포생태저류지', address: '강원특별자치도 강릉시 죽헌동 745', region: '강원도', district: '강릉시', source: 'visitkorea' },
  { name: '공주 충청남도역사박물관', address: '충청남도 공주시 국고개길 24', region: '충청남도', district: '공주시', source: 'visitkorea' },
  { name: '여수 승월마을', address: '전라남도 여수시 돌산읍 승월길 64', region: '전라남도', district: '여수시', source: 'visitkorea' },

  // seoul.go.kr 데이터
  { name: '개포로', address: '서울시 강남구 일원로 7', region: '서울', district: '강남구', source: 'seoul.go.kr' },
  { name: '양재천 제방', address: '서울시 강남구 양재천로', region: '서울', district: '강남구', source: 'seoul.go.kr' },
  { name: '불암산 스타디움', address: '서울시 노원구 노원로 186-10', region: '서울', district: '노원구', source: 'seoul.go.kr' },
  { name: '우이천변', address: '서울시 노원구 월계로45길 92', region: '서울', district: '노원구', source: 'seoul.go.kr' },
  { name: '경희대학교', address: '서울시 동대문구 경희대로 24', region: '서울', district: '동대문구', source: 'seoul.go.kr' },
  { name: '현충원', address: '서울시 동작구 현충로 210', region: '서울', district: '동작구', source: 'seoul.go.kr' },
  { name: '토정로', address: '서울시 마포구 독막로8길 49', region: '서울', district: '마포구', source: 'seoul.go.kr' },
  { name: '경의선숲길', address: '서울시 마포구 백범로36길 8-7', region: '서울', district: '마포구', source: 'seoul.go.kr' },
  { name: '연세로 명물거리', address: '서울시 서대문구 신촌로 99', region: '서울', district: '서대문구', source: 'seoul.go.kr' },
  { name: '안산도시자연공원', address: '서울시 서대문구 연희로32길 134', region: '서울', district: '서대문구', source: 'seoul.go.kr' },
  { name: '석촌호수(송파나루공원)', address: '서울시 송파구 석촌호수로 188', region: '서울', district: '송파구', source: 'seoul.go.kr' },
  { name: '남산공원 순환로', address: '서울시 중구 남산공원길 507', region: '서울', district: '중구', source: 'seoul.go.kr' },

  // wegive.co.kr 데이터 (주소 보완 필요)
  { name: '담양 관방제림', address: '전라남도 담양군 담양읍 객사리', region: '전라남도', district: '담양군', source: 'wegive' },
  { name: '곡성 섬진강 벚꽃길', address: '전라남도 곡성군 오곡면 섬진강로', region: '전라남도', district: '곡성군', source: 'wegive' },
  { name: '고흥 나로도', address: '전라남도 고흥군 봉래면 나로도', region: '전라남도', district: '고흥군', source: 'wegive' },
  { name: '영암 왕인박사유적지', address: '전라남도 영암군 군서면 왕인로 440', region: '전라남도', district: '영암군', source: 'wegive' },
  { name: '해남 대흥사', address: '전라남도 해남군 삼산면 대흥사길 400', region: '전라남도', district: '해남군', source: 'wegive' },
  { name: '논산 관촉사', address: '충청남도 논산시 관촉로1번길 25', region: '충청남도', district: '논산시', source: 'wegive' },
  { name: '보령 주산 벚꽃길', address: '충청남도 보령시 주산면', region: '충청남도', district: '보령시', source: 'wegive' },
  { name: '부여 구드래나루터', address: '충청남도 부여군 부여읍 구드래로 70', region: '충청남도', district: '부여군', source: 'wegive' },
  { name: '태안 해안도로', address: '충청남도 태안군 안면읍 해안관광로', region: '충청남도', district: '태안군', source: 'wegive' },
  { name: '홍성 홍주읍성', address: '충청남도 홍성군 홍성읍 오관리', region: '충청남도', district: '홍성군', source: 'wegive' },
  { name: '영동 용두공원', address: '충청북도 영동군 영동읍 용두공원길', region: '충청북도', district: '영동군', source: 'wegive' },
  { name: '영월 동강둔치', address: '강원특별자치도 영월군 영월읍 동강로', region: '강원도', district: '영월군', source: 'wegive' },
  { name: '인제 소양강변', address: '강원특별자치도 인제군 인제읍 소양강변', region: '강원도', district: '인제군', source: 'wegive' },
  { name: '양구 파로호', address: '강원특별자치도 양구군 양구읍 파로호로', region: '강원도', district: '양구군', source: 'wegive' },
  { name: '고성 화진포', address: '강원특별자치도 고성군 현내면 화진포길 280', region: '강원도', district: '고성군', source: 'wegive' },
  { name: '영덕 창포리', address: '경상북도 영덕군 남정면 창포리', region: '경상북도', district: '영덕군', source: 'wegive' },
  { name: '영주 서천둔치', address: '경상북도 영주시 휴천동 서천둔치', region: '경상북도', district: '영주시', source: 'wegive' },
  { name: '김해 연지공원', address: '경상남도 김해시 연지공원로 26', region: '경상남도', district: '김해시', source: 'wegive' },
  { name: '남해 왕지마을', address: '경상남도 남해군 남면 왕지길', region: '경상남도', district: '남해군', source: 'wegive' },
];

async function main() {
  console.log('벚꽃 명소 데이터 입력 시작...\n');

  // 기존 데이터 삭제
  console.log('기존 데이터 삭제 중...');
  await supabase.from('cherry_blossom_spots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('기존 데이터 삭제 완료\n');

  let successCount = 0;
  let failCount = 0;

  for (const spot of spots) {
    // 1. Kakao API로 좌표 변환
    const coords = await getCoordinates(spot.address);

    if (coords) {
      spot.latitude = coords.latitude;
      spot.longitude = coords.longitude;
      console.log(`✓ ${spot.name}: ${coords.latitude}, ${coords.longitude}`);
    } else {
      console.log(`✗ ${spot.name}: 좌표 변환 실패`);
    }

    // 2. Supabase에 입력
    const { error } = await supabase
      .from('cherry_blossom_spots')
      .insert({
        name: spot.name,
        address: spot.address,
        region: spot.region,
        district: spot.district,
        latitude: spot.latitude || null,
        longitude: spot.longitude || null,
        source: spot.source,
        bloom_period: '4월 초~중순'
      });

    if (error) {
      console.error(`  DB 입력 실패: ${error.message}`);
      failCount++;
    } else {
      successCount++;
    }

    // API 호출 제한 방지
    await sleep(100);
  }

  console.log(`\n완료: 성공 ${successCount}건, 실패 ${failCount}건`);
}

async function getCoordinates(address) {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      {
        headers: {
          'Authorization': `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
        }
      }
    );

    const data = await response.json();

    if (data.documents && data.documents.length > 0) {
      return {
        latitude: parseFloat(data.documents[0].y),
        longitude: parseFloat(data.documents[0].x)
      };
    }

    // 주소 검색 실패 시 키워드 검색 시도
    const keywordResponse = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(address)}`,
      {
        headers: {
          'Authorization': `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
        }
      }
    );

    const keywordData = await keywordResponse.json();

    if (keywordData.documents && keywordData.documents.length > 0) {
      return {
        latitude: parseFloat(keywordData.documents[0].y),
        longitude: parseFloat(keywordData.documents[0].x)
      };
    }

    return null;
  } catch (error) {
    console.error(`API 오류: ${error.message}`);
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
