/**
 * 벚꽃 명소 이미지 가져오기 스크립트
 * Daum 이미지 검색 API 사용
 * 실행: node scripts/fetch-images.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

async function searchImage(query) {
  const searchQuery = `${query} 벚꽃`;
  const url = `https://dapi.kakao.com/v2/search/image?query=${encodeURIComponent(searchQuery)}&size=1`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.documents && data.documents.length > 0) {
    const doc = data.documents[0];
    return {
      image_url: doc.image_url,
      image_source: doc.display_sitename || doc.doc_url
    };
  }

  return null;
}

async function main() {
  console.log('이미지 가져오기 시작...\n');

  // 모든 장소 가져오기
  const { data: spots, error } = await supabase
    .from('cherry_blossom_spots')
    .select('id, name')
    .order('id');

  if (error) {
    console.error('장소 가져오기 실패:', error.message);
    return;
  }

  console.log(`총 ${spots.length}개 장소\n`);

  let successCount = 0;
  let failCount = 0;

  for (const spot of spots) {
    try {
      const imageData = await searchImage(spot.name);

      if (imageData) {
        const { error: updateError } = await supabase
          .from('cherry_blossom_spots')
          .update({
            image_url: imageData.image_url,
            image_source: imageData.image_source
          })
          .eq('id', spot.id);

        if (updateError) {
          console.log(`✗ ${spot.name}: ${updateError.message}`);
          failCount++;
        } else {
          console.log(`✓ ${spot.name} - ${imageData.image_source}`);
          successCount++;
        }
      } else {
        console.log(`- ${spot.name}: 이미지 없음`);
        failCount++;
      }

      // API 호출 제한 방지를 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (err) {
      console.log(`✗ ${spot.name}: ${err.message}`);
      failCount++;
    }
  }

  console.log(`\n완료: 성공 ${successCount}건, 실패 ${failCount}건`);
}

main().catch(console.error);
