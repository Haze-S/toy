import cron from "node-cron";
import { runRankingJob } from "./jobs/ranking.job";

// ──────────────────────────────────────────
// 스케줄러
//
// node-cron은 리눅스의 crontab과 같은 문법을 사용:
// ┌────────── 초 (선택, 0-59)
// │ ┌──────── 분 (0-59)
// │ │ ┌────── 시 (0-23)
// │ │ │ ┌──── 일 (1-31)
// │ │ │ │ ┌── 월 (1-12)
// │ │ │ │ │ ┌ 요일 (0-7, 0과 7 = 일요일)
// │ │ │ │ │ │
// * * * * * *
//
// "0 3 * * *" → 매일 새벽 3시에 실행
//
// 왜 새벽 3시인가:
// - 유저 활동이 가장 적은 시간 → API 서버 부하 낮음
// - 전날 랭킹이 정산된 후
// ──────────────────────────────────────────

const CRON_SCHEDULE = process.env.COLLECTOR_CRON ?? "0 3 * * *";

export function startScheduler() {
  console.log(`스케줄러 시작: "${CRON_SCHEDULE}"`);

  cron.schedule(CRON_SCHEDULE, async () => {
    console.log(`[${new Date().toISOString()}] 스케줄 트리거`);
    try {
      await runRankingJob();
    } catch (error) {
      console.error("수집 작업 실패:", error);
    }
  });
}
