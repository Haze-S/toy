import "dotenv/config";
import { runRankingJob } from "./jobs/ranking.job";
import { startScheduler } from "./scheduler";

// ──────────────────────────────────────────
// Collector 진입점
//
// 실행 방법 2가지:
//
// 1. 수동 실행 (1회 수집 후 종료)
//    npm run collect
//
// 2. 스케줄러 모드 (데몬처럼 계속 실행, cron으로 자동 수집)
//    npm run collect -- --schedule
//
// 왜 분리하는가:
// - 개발 중에는 수동으로 돌려서 데이터 확인
// - 배포 후에는 스케줄러 모드로 상시 실행
// ──────────────────────────────────────────

const isScheduleMode = process.argv.includes("--schedule");

async function main() {
  if (isScheduleMode) {
    console.log("=== Collector: 스케줄러 모드 ===");
    startScheduler();
    // 스케줄러 모드에서는 프로세스가 종료되지 않음 (cron이 유지)
  } else {
    console.log("=== Collector: 수동 실행 모드 ===");
    await runRankingJob();
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Collector 실행 실패:", error);
  process.exit(1);
});
