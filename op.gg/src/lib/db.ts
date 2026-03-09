import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// ──────────────────────────────────────────
// Prisma Client 싱글톤 (Prisma 7 + pg 어댑터)
//
// Prisma 7부터 DB 드라이버를 직접 연결하는 방식으로 변경됨.
// 기존: PrismaClient가 내부적으로 DB 커넥션 관리
// 변경: pg Pool → PrismaPg 어댑터 → PrismaClient에 주입
//
// 장점: 커넥션 풀 설정을 직접 제어할 수 있음
// (max 커넥션 수, idle timeout 등)
//
// Next.js Hot Reload 대응:
// globalThis에 인스턴스를 저장해서 재사용.
// 안 하면 HMR 때마다 new Pool()이 생겨서 커넥션이 계속 쌓임.
// ──────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL!;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // pg 커넥션 풀 생성
  const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    max: 10, // 최대 동시 커넥션. 1인 프로젝트에 충분
  });

  // pg 풀을 Prisma 어댑터로 감쌈
  const adapter = new PrismaPg(pool);

  // 어댑터를 주입해서 PrismaClient 생성
  return new PrismaClient({ adapter }) as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
