import { NextRequest, NextResponse } from "next/server";
import { getClassDetail } from "@/features/meta/meta.service";

// ──────────────────────────────────────────
// GET /api/meta/classes/[className]?contentsType=1
//
// 특정 직업의 상세 메타 정보
// - 통계: 인원 수, 비율, 평균 순위/점수, 최고/최저 순위
// - 해당 직업 캐릭터 목록 (순위순)
// ──────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ className: string }> }
) {
  const { className } = await params;
  const decodedClassName = decodeURIComponent(className);
  const contentsType =
    request.nextUrl.searchParams.get("contentsType") ?? "1";

  const result = await getClassDetail(decodedClassName, contentsType);

  if (!result) {
    return NextResponse.json(
      { error: "해당 직업의 데이터가 없습니다" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
