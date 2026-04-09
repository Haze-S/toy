import { prisma } from "@/lib/db";
import { cached } from "@/lib/cache";
import { CACHE_TTL } from "@/lib/constants";

// ──────────────────────────────────────────
// 랭킹 조회 서비스
// ──────────────────────────────────────────

export interface RankingItem {
  rank: number;
  characterName: string;
  className: string;
  guildName: string | null;
  score: number;
  rawData: Record<string, unknown> | null;
}

export interface RankingListResponse {
  data: RankingItem[];
  meta: {
    contentsType: string;
    collectionId: number;
    snapshotAt: string;
    totalCount: number;
  };
}

/**
 * 최신 랭킹 Top N 조회
 *
 * Prisma ORM 문법으로 조회. 집계가 아니라 단순 목록이라 ORM이 적합.
 * findMany + orderBy로 SQL의 SELECT ... ORDER BY rank ASC와 같음.
 */
export async function getLatestRankings(
  contentsType: string = "1",
  limit: number = 100
): Promise<RankingListResponse | null> {
  return cached(
    `rankings:latest:${contentsType}:${limit}`,
    CACHE_TTL.RANKINGS_LATEST,
    () => _getLatestRankings(contentsType, limit)
  );
}

async function _getLatestRankings(
  contentsType: string,
  limit: number
): Promise<RankingListResponse | null> {
  const latestCollection = await prisma.rankingCollection.findFirst({
    where: { contentsType },
    orderBy: { collectedAt: "desc" },
  });

  if (!latestCollection) return null;

  const snapshots = await prisma.rankingSnapshot.findMany({
    where: { collectionId: latestCollection.id },
    orderBy: { rank: "asc" },
    take: limit,
  });

  return {
    data: snapshots.map((s) => ({
      rank: s.rank,
      characterName: s.characterName,
      className: s.className,
      guildName: s.guildName,
      score: Number(s.score),
      rawData: s.rawData as Record<string, unknown> | null,
    })),
    meta: {
      contentsType,
      collectionId: Number(latestCollection.id),
      snapshotAt: latestCollection.collectedAt.toISOString(),
      totalCount: snapshots.length,
    },
  };
}

/**
 * 길드 점유율 통계
 */
export interface GuildStat {
  guildName: string;
  count: number;
  ratio: number;
}

export interface GuildStatsResponse {
  data: GuildStat[];
  meta: {
    contentsType: string;
    collectionId: number;
    snapshotAt: string;
  };
}

export async function getGuildStats(
  contentsType: string = "1"
): Promise<GuildStatsResponse | null> {
  return cached(
    `guilds:stats:${contentsType}`,
    CACHE_TTL.GUILD_STATS,
    () => _getGuildStats(contentsType)
  );
}

async function _getGuildStats(
  contentsType: string
): Promise<GuildStatsResponse | null> {
  const latestCollection = await prisma.rankingCollection.findFirst({
    where: { contentsType },
    orderBy: { collectedAt: "desc" },
  });

  if (!latestCollection) return null;

  const stats = await prisma.$queryRaw<
    { guild_name: string; count: number }[]
  >`
    SELECT
      COALESCE(guild_name, '(무소속)') AS guild_name,
      COUNT(*)::int AS count
    FROM ranking_snapshots
    WHERE collection_id = ${latestCollection.id}
      AND guild_name IS NOT NULL
      AND guild_name != ''
    GROUP BY guild_name
    ORDER BY count DESC
    LIMIT 20
  `;

  const total = stats.reduce((sum, s) => sum + s.count, 0);

  return {
    data: stats.map((s) => ({
      guildName: s.guild_name,
      count: s.count,
      ratio: Math.round((s.count / total) * 1000) / 10,
    })),
    meta: {
      contentsType,
      collectionId: Number(latestCollection.id),
      snapshotAt: latestCollection.collectedAt.toISOString(),
    },
  };
}
