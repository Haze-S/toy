import { Suspense } from "react";
import {
  getLatestRankings,
  getGuildStats,
} from "@/features/ranking/ranking.service";
import { getClassColor } from "@/lib/class-colors";
import ContentsTypeTabs from "@/components/ui/contents-type-tabs";

export const revalidate = 3600;

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ contentsType?: string }>;
}) {
  const params = await searchParams;
  const contentsType = params.contentsType ?? "1";

  const [rankings, guilds] = await Promise.all([
    getLatestRankings(contentsType, 100),
    getGuildStats(contentsType),
  ]);

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-1">랭킹</h1>
        <p className="text-zinc-500 text-sm">
          이스라펠 서버 · Top 100
        </p>
      </section>

      <section className="mb-8">
        <Suspense>
          <ContentsTypeTabs />
        </Suspense>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 랭킹 테이블 (2/3) */}
        <section className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          {!rankings ? (
            <div className="p-12 text-center">
              <p className="text-zinc-500">데이터가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900">
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      캐릭터
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      직업
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      길드
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      점수
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {rankings.data.map((r) => {
                    const color = getClassColor(r.className);
                    return (
                      <tr
                        key={r.rank}
                        className="hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          {r.rank <= 3 ? (
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                r.rank === 1
                                  ? "bg-amber-500/20 text-amber-400"
                                  : r.rank === 2
                                    ? "bg-zinc-400/20 text-zinc-300"
                                    : "bg-amber-700/20 text-amber-600"
                              }`}
                            >
                              {r.rank}
                            </span>
                          ) : (
                            <span className="text-zinc-600 font-mono pl-1">
                              {r.rank}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {r.characterName}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                            style={{
                              backgroundColor: color.bg + "20",
                              color: color.text,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: color.bg }}
                            />
                            {r.className}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-400">
                          {r.guildName ?? "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs text-zinc-300">
                          {r.score.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 길드 점유율 사이드바 (1/3) */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-semibold mb-5">길드 점유율</h2>
            {!guilds ? (
              <p className="text-zinc-500 text-sm">데이터 없음</p>
            ) : (
              <div className="space-y-3">
                {guilds.data.slice(0, 10).map((g, i) => (
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
                        <span className="text-sm truncate">{g.guildName}</span>
                        <span className="text-xs text-zinc-400 ml-2 shrink-0">
                          {g.count}명 ({g.ratio}%)
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

          {rankings && (
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
                    {new Date(rankings.meta.snapshotAt).toLocaleDateString(
                      "ko-KR"
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">인원 수</dt>
                  <dd>{rankings.meta.totalCount}명</dd>
                </div>
              </dl>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
