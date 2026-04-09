// ──────────────────────────────────────────
// 게임 설정
// ──────────────────────────────────────────

export const GAME_ID = "aion2";

export const API_BASE_URL = "https://aion2.plaync.com/api";

// ──────────────────────────────────────────
// 직업 (classId → 영문명/한글명 매핑)
// /api/gameinfo/classes 응답 기준
// ──────────────────────────────────────────

export const CLASSES = {
  2: { name: "Gladiator", text: "검성" },
  3: { name: "Templar", text: "수호성" },
  4: { name: "Ranger", text: "궁성" },
  5: { name: "Assassin", text: "살성" },
  6: { name: "Elementalist", text: "정령성" },
  7: { name: "Sorcerer", text: "마도성" },
  8: { name: "Cleric", text: "치유성" },
  9: { name: "Chanter", text: "호법성" },
} as const;

export type ClassId = keyof typeof CLASSES;

// ──────────────────────────────────────────
// 랭킹 콘텐츠 타입
// rankingContentsType 파라미터 값
// ──────────────────────────────────────────

export const RANKING_CONTENTS_TYPES = {
  1: "어비스",
  3: "악몽",
  4: "초월",
  5: "고독의 투기장",
  6: "협력의 투기장",
  20: "토벌전",
  21: "각성전",
} as const;

export type RankingContentsType = keyof typeof RANKING_CONTENTS_TYPES;

// ──────────────────────────────────────────
// 서버 (종족별로 구분됨)
// raceId 1 = 천족 (1001~1021)
// raceId 2 = 마족 (2001~2021)
// 전체 목록은 /api/gameinfo/servers 로 동적 조회 가능
// ──────────────────────────────────────────

// 수집 대상 서버 (필요한 서버만 추가)
export const TARGET_SERVER_IDS = [2001] as const; // 이스라펠

// ──────────────────────────────────────────
// 수집 설정
// ──────────────────────────────────────────

// 수집할 콘텐츠 타입 목록
export const TARGET_CONTENTS_TYPES: RankingContentsType[] = [1, 5, 6, 3, 4, 20, 21];

export const COLLECTION_TOP_N = 100;

// ──────────────────────────────────────────
// 캐시 TTL (초)
// ──────────────────────────────────────────

export const CACHE_TTL = {
  RANKINGS_LATEST: 600,  // 10분
  META_CLASSES: 1800,    // 30분
  META_CLASS_DETAIL: 1800, // 30분
  META_TREND: 3600,      // 1시간
  GUILD_STATS: 1800,     // 30분
} as const;
