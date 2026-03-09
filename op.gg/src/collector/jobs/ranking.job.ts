import { prisma } from "@/lib/db";
import {
  TARGET_SERVER_IDS,
  TARGET_CONTENTS_TYPES,
  RANKING_CONTENTS_TYPES,
} from "@/lib/constants";
import { fetchRankingList } from "../ranking-api.client";
import type { RankingEntry } from "../ranking-api.types";

// ──────────────────────────────────────────
// 랭킹 수집 작업
//
// 흐름:
// 1. 대상 서버 × 콘텐츠 타입 조합을 순회
// 2. 각 조합마다 API 호출 → Top 100 응답
// 3. ranking_collections 행 생성 (이 수집 세션의 메타 정보)
// 4. ranking_snapshots 100행 bulk insert
// 5. 다음 호출 전 딜레이 (rate limit 방지)
//
// 왜 순차 호출인가:
// - 공식 API에 rate limit이 있을 수 있음 (문서가 없으니 보수적으로)
// - 병렬로 쏘면 IP 차단 위험
// - 하루 1회 수집이라 속도보다 안정성이 중요
// ──────────────────────────────────────────

/** API 호출 간 대기 시간 (ms) */
const REQUEST_DELAY = 2000;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 단일 (서버, 콘텐츠 타입) 조합 수집
 * 이 함수가 수집의 최소 단위
 */
async function collectOne(serverId: number, contentsType: number) {
  const contentsName =
    RANKING_CONTENTS_TYPES[contentsType as keyof typeof RANKING_CONTENTS_TYPES];

  console.log(`  [수집] 서버=${serverId} 콘텐츠=${contentsName}(${contentsType})`);

  // 1. API 호출
  const response = await fetchRankingList({
    rankingContentsType: contentsType,
    serverId,
  });

  const entries = response.rankingList;
  if (!entries || entries.length === 0) {
    console.log(`  [스킵] 데이터 없음`);
    return;
  }

  // 2. 수집 세션 생성 (이 100명은 같은 시점에 수집됐다)
  const collection = await prisma.rankingCollection.create({
    data: {
      gameId: "aion2",
      server: String(serverId),
      rankingType: String(response.rankingList[0]?.rankingType ?? 0),
      contentsType: String(contentsType),
      totalCount: entries.length,
    },
  });

  // 3. 스냅샷 bulk insert
  //    createMany는 한 번의 SQL로 100행을 넣어서 빠름
  await prisma.rankingSnapshot.createMany({
    data: entries.map((entry: RankingEntry) => ({
      collectionId: collection.id,
      rank: entry.rank,
      characterName: entry.characterName,
      className: entry.className,
      guildName: entry.guildName,
      score: BigInt(entry.point),
      // JSON.parse(JSON.stringify())로 순수 JSON 객체로 변환
      // Prisma JSONB 필드는 순수 JSON만 받음 (class 인스턴스 불가)
      rawData: JSON.parse(JSON.stringify(entry)),
    })),
  });

  console.log(`  [완료] ${entries.length}명 저장 (collectionId=${collection.id})`);
}

/**
 * 전체 수집 실행
 * 모든 (서버, 콘텐츠 타입) 조합을 순차적으로 수집
 */
export async function runRankingJob() {
  console.log("=== 랭킹 수집 시작 ===");
  console.log(`대상 서버: ${TARGET_SERVER_IDS.join(", ")}`);
  console.log(`대상 콘텐츠: ${TARGET_CONTENTS_TYPES.join(", ")}`);

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  for (const serverId of TARGET_SERVER_IDS) {
    for (const contentsType of TARGET_CONTENTS_TYPES) {
      try {
        await collectOne(serverId, contentsType);
        successCount++;
      } catch (error) {
        failCount++;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  [실패] 서버=${serverId} 콘텐츠=${contentsType}: ${message}`);
      }

      // rate limit 방지 딜레이
      await delay(REQUEST_DELAY);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`=== 수집 완료: 성공=${successCount} 실패=${failCount} (${elapsed}초) ===`);
}
