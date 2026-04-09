import { redis } from "./redis";

// ──────────────────────────────────────────
// 캐시 헬퍼
//
// 패턴: Cache-Aside (Lazy Loading)
// 1. 캐시에 있으면 → 바로 반환 (빠름)
// 2. 캐시에 없으면 → fetcher 실행 → 결과를 캐시에 저장 → 반환
//
// 왜 이 패턴인가:
// - 구현이 단순 (Write-Through 대비)
// - 캐시 미스 시에만 DB 부하 발생
// - TTL로 자동 만료되니 별도 무효화 로직 불필요
//   (하루 1회 수집이라 30분~1시간 TTL이면 충분)
//
// BigInt 처리:
// JSON.stringify는 BigInt를 직렬화 못 함.
// replacer/reviver로 BigInt → string 변환 처리.
// ──────────────────────────────────────────

function jsonStringify(data: unknown): string {
  return JSON.stringify(data, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
}

/**
 * 캐시 우선 조회. 미스 시 fetcher 실행 후 캐시에 저장.
 *
 * @param key - Redis 키 (예: "meta:classes:1")
 * @param ttl - 만료 시간 (초)
 * @param fetcher - 캐시 미스 시 실행할 함수 (DB 쿼리 등)
 */
export async function cached<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    // 1. 캐시 조회
    const hit = await redis.get(key);
    if (hit) {
      return JSON.parse(hit) as T;
    }
  } catch {
    // Redis 장애 시 캐시 무시하고 DB 직접 조회
    // 서비스가 Redis 없이도 동작하도록 (graceful degradation)
  }

  // 2. 캐시 미스 → fetcher 실행
  const data = await fetcher();

  // 3. 결과를 캐시에 저장 (비동기, 응답을 블로킹하지 않음)
  try {
    await redis.set(key, jsonStringify(data), "EX", ttl);
  } catch {
    // Redis 저장 실패해도 응답은 정상 반환
  }

  return data;
}

/**
 * 특정 패턴의 캐시 삭제
 * 수집 완료 후 호출하면 다음 요청부터 새 데이터가 반영됨
 *
 * @param pattern - Redis 키 패턴 (예: "meta:*")
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // 무효화 실패해도 TTL로 자연 만료됨
  }
}
