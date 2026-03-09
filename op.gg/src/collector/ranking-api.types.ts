// ──────────────────────────────────────────
// 아이온2 랭킹 API 응답 타입
// 실제 API 응답 (https://aion2.plaync.com/api/ranking/list) 기준
// ──────────────────────────────────────────

/** 시즌 정보 */
export interface Season {
  rankingContentsType: number;
  state: number;
  groupName: string;
  seasonNo: number;
  prevSeasonNo: number;
  startDate: string; // ISO 8601
  endDate: string;
}

/** 랭킹 목록의 각 항목 */
export interface RankingEntry {
  rankingContentsType: number | null;
  rankingContentsName: string | null;
  rankingType: number;
  rank: number;
  characterId: string;
  characterName: string;
  classId: number;
  className: string;
  guildName: string | null;
  point: number;
  prevRank: number;
  rankChange: number;
  gradeId: number;
  gradeName: string;
  gradeIcon: string;
  profileImage: string;
  extraDataMap: Record<string, number> | null;
}

/** /api/ranking/list 전체 응답 */
export interface RankingListResponse {
  season: Season;
  rankingList: RankingEntry[];
  myRanking: RankingEntry | null;
  friendRankingList: RankingEntry[] | null;
}

/** /api/gameinfo/servers 서버 항목 */
export interface ServerEntry {
  raceId: number;
  serverId: number;
  serverName: string;
  serverShortName: string;
}

/** /api/gameinfo/servers 전체 응답 */
export interface ServerListResponse {
  serverList: ServerEntry[];
}

/** /api/ranking/list 요청 파라미터 */
export interface RankingListParams {
  rankingContentsType: number;
  rankingType?: number;  // 기본값 0
  serverId: number;
  characterId?: string;
  lang?: string;         // 기본값 'ko'
}
