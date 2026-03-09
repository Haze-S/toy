import { prisma } from "@/lib/db";
import { cached } from "@/lib/cache";
import { CACHE_TTL } from "@/lib/constants";

// ──────────────────────────────────────────
// 메타 분석 서비스
//
// "최신 수집 기준으로 직업별 통계를 내는 것"이 핵심.
//
// 왜 raw SQL($queryRaw)을 쓰는가:
// - GROUP BY, COUNT, AVG 같은 집계는 Prisma ORM 문법보다
//   SQL이 더 직관적이고 성능도 좋음
// - Prisma는 CRUD에 강하고, 집계에는 SQL이 맞음
// ──────────────────────────────────────────

// ──────────────────────────────────────────
// 직업 상세 메타
// ──────────────────────────────────────────

export interface ClassDetailCharacter {
  rank: number;
  characterName: string;
  score: number;
  guildName: string | null;
  level: number | null;
}

export interface ClassDetailData {
  className: string;
  count: number;
  ratio: number;
  avgRank: number;
  avgScore: number;
  minRank: number;
  maxRank: number;
  characters: ClassDetailCharacter[];
}

export interface ClassDetailResponse {
  data: ClassDetailData;
  meta: {
    contentsType: string;
    collectionId: number;
    snapshotAt: string;
  };
}

/**
 * 특정 직업 상세 메타
 *
 * 해당 직업의 통계(인원, 비율, 평균 순위/점수, 최고/최저 순위)와
 * 캐릭터 목록을 반환
 */
export async function getClassDetail(
  className: string,
  contentsType: string = "1"
): Promise<ClassDetailResponse | null> {
  return cached(
    `meta:class:${className}:${contentsType}`,
    CACHE_TTL.META_CLASS_DETAIL,
    () => _getClassDetail(className, contentsType)
  );
}

async function _getClassDetail(
  className: string,
  contentsType: string
): Promise<ClassDetailResponse | null> {
  // 1. 최신 수집 세션 찾기
  const latestCollection = await prisma.rankingCollection.findFirst({
    where: { contentsType },
    orderBy: { collectedAt: "desc" },
  });

  if (!latestCollection) return null;

  // 2. 해당 직업 통계 (집계 → raw SQL)
  const stats = await prisma.$queryRaw<
    { count: number; avg_rank: number; avg_score: number; min_rank: number; max_rank: number }[]
  >`
    SELECT
      COUNT(*)::int AS count,
      ROUND(AVG(rank), 1)::float AS avg_rank,
      ROUND(AVG(score))::bigint AS avg_score,
      MIN(rank) AS min_rank,
      MAX(rank) AS max_rank
    FROM ranking_snapshots
    WHERE collection_id = ${latestCollection.id}
      AND class_name = ${className}
  `;

  if (!stats[0] || stats[0].count === 0) return null;

  const stat = stats[0];

  // 3. 전체 인원 수 (비율 계산용)
  const totalCount = latestCollection.totalCount ?? 100;

  // 4. 해당 직업 캐릭터 목록 (단순 조회 → Prisma ORM)
  const snapshots = await prisma.rankingSnapshot.findMany({
    where: {
      collectionId: latestCollection.id,
      className,
    },
    orderBy: { rank: "asc" },
  });

  return {
    data: {
      className,
      count: stat.count,
      ratio: Math.round((stat.count / totalCount) * 1000) / 10,
      avgRank: Number(stat.avg_rank),
      avgScore: Number(stat.avg_score),
      minRank: stat.min_rank,
      maxRank: stat.max_rank,
      characters: snapshots.map((s) => ({
        rank: s.rank,
        characterName: s.characterName,
        score: Number(s.score),
        guildName: s.guildName,
        level: s.level,
      })),
    },
    meta: {
      contentsType,
      collectionId: Number(latestCollection.id),
      snapshotAt: latestCollection.collectedAt.toISOString(),
    },
  };
}

// ──────────────────────────────────────────
// 직업별 점유율 통계
// ──────────────────────────────────────────

export interface ClassMeta {
  className: string;
  count: number;
  ratio: number;
  avgRank: number;
  avgScore: number;
}

export interface ClassMetaResponse {
  data: ClassMeta[];
  meta: {
    contentsType: string;
    collectionId: number;
    snapshotAt: string;
  };
}

/**
 * 직업별 점유율 통계
 *
 * 특정 콘텐츠 타입의 가장 최근 수집 기준으로
 * 직업별 인원 수, 비율, 평균 순위, 평균 점수를 계산
 */
export async function getClassMeta(
  contentsType: string = "1"
): Promise<ClassMetaResponse | null> {
  return cached(`meta:classes:${contentsType}`, CACHE_TTL.META_CLASSES, () =>
    _getClassMeta(contentsType)
  );
}

async function _getClassMeta(
  contentsType: string
): Promise<ClassMetaResponse | null> {
  // 1. 해당 콘텐츠 타입의 최신 수집 세션 찾기
  const latestCollection = await prisma.rankingCollection.findFirst({
    where: { contentsType },
    orderBy: { collectedAt: "desc" },
  });

  if (!latestCollection) return null;

  // 2. 그 수집의 직업별 집계
  //    $queryRaw는 Prisma가 SQL을 직접 실행하게 해줌
  //    Tagged template literal로 SQL injection 방지됨
  const stats = await prisma.$queryRaw<
    { class_name: string; count: number; avg_rank: number; avg_score: number }[]
  >`
    SELECT
      class_name,
      COUNT(*)::int AS count,
      ROUND(AVG(rank), 1)::float AS avg_rank,
      ROUND(AVG(score))::bigint AS avg_score
    FROM ranking_snapshots
    WHERE collection_id = ${latestCollection.id}
    GROUP BY class_name
    ORDER BY count DESC
  `;

  const total = stats.reduce((sum, s) => sum + s.count, 0);

  return {
    data: stats.map((s) => ({
      className: s.class_name,
      count: s.count,
      ratio: Math.round((s.count / total) * 1000) / 10, // 소수점 1자리 %
      avgRank: Number(s.avg_rank),
      avgScore: Number(s.avg_score),
    })),
    meta: {
      contentsType,
      collectionId: Number(latestCollection.id),
      snapshotAt: latestCollection.collectedAt.toISOString(),
    },
  };
}
