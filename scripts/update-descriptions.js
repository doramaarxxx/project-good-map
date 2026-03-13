/**
 * 벚꽃 명소 설명 업데이트 스크립트
 * 실행: node scripts/update-descriptions.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const descriptions = [
  { name: '경주 대릉원', description: '신라 시대 왕들의 무덤이 모여 있는 곳으로 돌담길을 따라 벚나무들이 길게 늘어서 있어 봄철 벚꽃 명소로 유명하다.' },
  { name: '강릉 경포생태저류지', description: '끝없이 펼쳐진 산책로를 따라 머리 위로 쏟아지는 벚꽃을 만끽할 수 있는 강릉의 숨은 벚꽃 명소.' },
  { name: '공주 충청남도역사박물관', description: '박물관 주변으로 벚꽃이 만개하며 역사 유적과 함께 봄꽃을 감상할 수 있다.' },
  { name: '여수 승월마을', description: '벚꽃 터널을 지나면 승월저수지를 배경으로 호수와 벚꽃이 어우러진 절경을 볼 수 있다.' },
  { name: '개포로', description: '대청타워에서 남부순환로까지 이어지는 벚꽃길로 서울 강남의 대표적인 봄꽃 명소.' },
  { name: '양재천 제방', description: '양재천을 따라 조성된 벚꽃길로 산책과 자전거 타기에 좋은 서울 시민들의 봄나들이 장소.' },
  { name: '경희대학교', description: '고풍스러운 유럽풍 건물과 벚꽃이 어우러져 마치 외국에 온 듯한 분위기를 연출하는 캠퍼스 벚꽃 명소.' },
  { name: '현충원', description: '국립서울현충원 내 벚꽃길로 호국 영령을 기리며 고즈넉한 분위기에서 벚꽃을 감상할 수 있다.' },
  { name: '경의선숲길', description: '옛 경의선 철도 부지를 공원으로 조성한 곳으로 도심 속 벚꽃 산책로로 인기가 높다.' },
  { name: '연세로 명물거리', description: '신촌 연세로를 따라 펼쳐진 벚꽃길로 젊은 분위기와 함께 봄을 만끽할 수 있다.' },
  { name: '안산도시자연공원', description: '서대문구 안산 자락을 따라 조성된 벚꽃 산책로로 서울 시내를 조망하며 벚꽃을 즐길 수 있다.' },
  { name: '석촌호수(송파나루공원)', description: '롯데월드타워를 배경으로 호수 주변에 만개한 벚꽃이 장관을 이루는 서울 대표 벚꽃 명소.' },
  { name: '남산공원 순환로', description: '남산타워를 배경으로 순환도로를 따라 벚꽃이 만개하여 서울의 봄을 대표하는 명소.' },
  { name: '담양 관방제림', description: '천연기념물로 지정된 숲길로 벚꽃과 함께 고목들이 어우러져 운치 있는 봄 산책을 즐길 수 있다.' },
  { name: '곡성 섬진강 벚꽃길', description: '섬진강을 따라 이어지는 벚꽃길로 강변의 아름다운 풍경과 함께 드라이브하기 좋은 명소.' },
  { name: '고흥 나로도', description: '나로우주센터가 있는 나로도의 해안도로를 따라 벚꽃이 피어 바다와 벚꽃을 함께 감상할 수 있다.' },
  { name: '영암 왕인박사유적지', description: '왕인박사의 유적지 주변으로 벚꽃이 만개하여 역사 탐방과 함께 봄꽃을 즐길 수 있다.' },
  { name: '해남 대흥사', description: '두륜산 자락의 천년 고찰로 사찰 진입로를 따라 벚꽃이 피어 고즈넉한 봄 풍경을 선사한다.' },
  { name: '논산 관촉사', description: '은진미륵으로 유명한 사찰로 경내와 주변에 벚꽃이 피어 봄철 참배객들의 발길이 이어진다.' },
  { name: '보령 주산 벚꽃길', description: '주산면 일대의 벚꽃길로 한적한 시골 풍경과 함께 여유로운 봄 드라이브를 즐길 수 있다.' },
  { name: '부여 구드래나루터', description: '백마강변 구드래나루터 주변으로 벚꽃이 피어 백제의 역사를 느끼며 봄꽃을 감상할 수 있다.' },
  { name: '태안 해안도로', description: '서해안을 따라 이어지는 해안도로에 벚꽃이 피어 바다와 꽃을 동시에 즐길 수 있는 드라이브 코스.' },
  { name: '홍성 홍주읍성', description: '조선시대 읍성 주변으로 벚꽃이 만개하여 역사 유적과 함께 봄나들이하기 좋은 명소.' },
  { name: '영동 용두공원', description: '영동군 중심부의 공원으로 벚꽃이 피면 지역 주민들의 봄 휴식처가 된다.' },
  { name: '영월 동강둔치', description: '동강변 둔치를 따라 벚꽃이 피어 강원도의 맑은 자연과 함께 봄을 만끽할 수 있다.' },
  { name: '인제 소양강변', description: '소양강을 따라 조성된 벚꽃길로 강원도 인제의 청정 자연 속에서 봄꽃을 감상할 수 있다.' },
  { name: '양구 파로호', description: '파로호 주변으로 벚꽃이 피어 호수의 잔잔한 물결과 함께 평화로운 봄 풍경을 선사한다.' },
  { name: '고성 화진포', description: '동해안 화진포 호수 주변에 벚꽃이 피어 호수와 바다, 벚꽃을 한 번에 즐길 수 있다.' },
  { name: '영덕 창포리', description: '동해안 영덕의 작은 마을로 바닷바람과 함께 벚꽃을 감상할 수 있는 숨은 명소.' },
  { name: '영주 서천둔치', description: '서천 강변 둔치를 따라 벚꽃이 피어 영주 시민들의 봄 산책 명소로 사랑받는다.' },
  { name: '김해 연지공원', description: '김해시 중심부의 도심 공원으로 연못 주변에 벚꽃이 만개하여 시민들의 휴식처가 된다.' },
  { name: '남해 왕지마을', description: '남해 바다를 배경으로 한 작은 마을에 벚꽃이 피어 그림 같은 봄 풍경을 연출한다.' },
  { name: '불암산 스타디움', description: '노원구 불암산 자락의 스타디움 주변으로 벚꽃이 피어 운동과 함께 봄꽃을 즐길 수 있다.' },
  { name: '우이천변', description: '우이천을 따라 조성된 벚꽃길로 노원구 주민들의 봄 산책 코스로 인기가 높다.' },
  { name: '토정로', description: '마포구 토정로를 따라 벚꽃이 피어 도심 속에서 봄을 느낄 수 있는 거리.' },
];

async function main() {
  console.log('설명 업데이트 시작...\n');

  let successCount = 0;

  for (const item of descriptions) {
    const { error } = await supabase
      .from('cherry_blossom_spots')
      .update({ description: item.description })
      .eq('name', item.name);

    if (error) {
      console.log(`✗ ${item.name}: ${error.message}`);
    } else {
      console.log(`✓ ${item.name}`);
      successCount++;
    }
  }

  console.log(`\n완료: ${successCount}건 업데이트`);
}

main().catch(console.error);
