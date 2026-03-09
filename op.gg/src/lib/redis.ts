import Redis from "ioredis";

// Redis Client 싱글톤
//
// Prisma와 같은 이유로 싱글톤 처리.
// ioredis는 연결이 끊기면 자동 재연결을 시도함 (기본 설정).
//
// REDIS_URL 형식: "redis://localhost:6379"
// 인증이 필요하면: "redis://:password@host:port"

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3, // 요청당 최대 재시도 3회
    lazyConnect: true, // 실제 명령 실행 시점에 연결 (앱 시작 속도 향상)
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
