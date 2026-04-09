import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";
import type {
  RankingListParams,
  RankingListResponse,
  ServerListResponse,
} from "./ranking-api.types";

// ──────────────────────────────────────────
// 아이온2 공식 API 클라이언트
//
// 역할: HTTP 호출 + 응답 반환. 그 이상의 로직은 넣지 않음.
// DB 저장, 분석, 캐싱 등은 호출하는 쪽(job)에서 처리.
//
// 왜 axios를 쓰는가:
// - fetch도 되지만, axios는 타임아웃/인터셉터/에러 핸들링이 기본 내장
// - API가 5xx를 주거나 느릴 때 대응하기 편함
// ──────────────────────────────────────────

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000, // 10초. 공식 API가 느릴 수 있으니 넉넉하게
  headers: {
    "Accept-Language": "ko",
  },
});

/**
 * 랭킹 목록 조회
 *
 * @example
 * const data = await fetchRankingList({
 *   rankingContentsType: 20, // 토벌전
 *   serverId: 2001,          // 이스라펠
 * });
 * console.log(data.rankingList.length); // 100
 */
export async function fetchRankingList(
  params: RankingListParams
): Promise<RankingListResponse> {
  const { data } = await client.get<RankingListResponse>("/ranking/list", {
    params: {
      lang: params.lang ?? "ko",
      rankingContentsType: params.rankingContentsType,
      rankingType: params.rankingType ?? 0,
      serverId: params.serverId,
      characterId: params.characterId ?? "",
    },
  });
  return data;
}

/**
 * 서버 목록 조회
 *
 * 서버 목록은 자주 바뀌지 않으므로 앱 시작 시 1회 호출 후 캐싱하면 됨.
 */
export async function fetchServerList(): Promise<ServerListResponse> {
  const { data } = await client.get<ServerListResponse>("/gameinfo/servers", {
    params: { lang: "ko" },
  });
  return data;
}
