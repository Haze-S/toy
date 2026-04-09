import { Suspense } from "react";
import Link from "next/link";
import { getClassMeta } from "@/features/meta/meta.service";
import { getGuildStats } from "@/features/ranking/ranking.service";
import { getClassColor } from "@/lib/class-colors";
import ContentsTypeTabs from "@/components/ui/contents-type-tabs";

export const revalidate = 3600;

// ──────────────────────────────────────────
// searchParams로 콘텐츠 타입을 받는 구조
//
// Next.js App Router에서 서버 컴포넌트는 searchParams를
// props로 받을 수 있음. URL이 /?contentsType=20 이면
// searchParams.contentsType === "20"
//
// 이 방식의 장점:
// - 각 탭이 고유 URL → 공유/북마크 가능
// - SSR이 유지됨 → SEO에 유리
// - 브라우저 뒤로가기가 자연스럽게 동작
// ──────────────────────────────────────────

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ contentsType?: string }>;
}) {
  const params = await searchParams;
  const contentsType = params.contentsType ?? "1";

  const [meta, guilds] = await Promise.all([
    getClassMeta(contentsType),
    getGuildStats(contentsType),
  ]);

  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-1">메타 분석</h1>
        <p className="text-zinc-500 text-sm">
          이스라펠 서버 · Top 100 기준 직업 점유율 및 길드 분포
        </p>
      </section>

      {/* 콘텐츠 타입 탭 */}
      <section className="mb-8">
        <Suspense>
          <ContentsTypeTabs />
        </Suspense>
      </section>

      {!meta ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-zinc-500">데이터가 아직 수집되지 않았습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 직업별 점유율 (2/3) */}
          <section className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-semibold mb-5">직업별 점유율</h2>
            <div className="space-y-3">
              {meta.data.map((cls) => {
                const color = getClassColor(cls.className);
                return (
                  <div key={cls.className} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-3">
                        {/* 직업 컬러 도트 */}
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: color.bg }}
                        />
                        <Link
                          href={`/classes/${encodeURIComponent(cls.className)}?contentsType=${contentsType}`}
                          className="font-medium text-sm hover:underline"
                        >
                          {cls.className}
                        </Link>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-zinc-400">
                          {cls.count}명
                        </span>
                        <span
                          className="font-semibold w-12 text-right"
                          style={{ color: color.text }}
                        >
                          {cls.ratio}%
                        </span>
                      </div>
                    </div>
                    {/* 프로그레스 바 */}
                    <div className="h-8 w-full rounded-lg bg-zinc-800/80 overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all duration-500 flex items-center pl-3"
                        style={{
                          width: `${Math.max(cls.ratio, 3)}%`,
                          backgroundColor: color.bg + "cc",
                        }}
                      >
                        <span className="text-xs font-medium text-white/80">
                          평균 {cls.avgRank}위
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 사이드바 */}
          <aside className="space-y-6">
            {/* 길드 점유율 카드 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="text-lg font-semibold mb-4">길드 점유율</h2>
              {!guilds ? (
                <p className="text-zinc-500 text-sm">데이터 없음</p>
              ) : (
                <div className="space-y-3">
                  {guilds.data.slice(0, 8).map((g, i) => (
                    <div key={g.guildName} className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold w-5 text-right ${
                          i < 3 ? "text-amber-400" : "text-zinc-500"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm truncate">
                            {g.guildName}
                          </span>
                          <span className="text-xs text-zinc-400 ml-2">
                            {g.count}명
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-zinc-800">
                          <div
                            className="h-1.5 rounded-full bg-emerald-500/80"
                            style={{ width: `${g.ratio}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 수집 정보 카드 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">
                수집 정보
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">서버</dt>
                  <dd>이스라펠</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">데이터 기준</dt>
                  <dd>
                    {new Date(meta.meta.snapshotAt).toLocaleDateString("ko-KR")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">분석 대상</dt>
                  <dd>Top 100</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
