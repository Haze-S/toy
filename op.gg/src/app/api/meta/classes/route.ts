import { NextRequest, NextResponse } from "next/server";
import { getClassMeta } from "@/features/meta/meta.service";

// ──────────────────────────────────────────
// GET /api/meta/classes?contentsType=1
//
// API Route는 "얇은 레이어"
// - 요청 파라미터 파싱
// - 서비스 호출
// - 응답 포맷 변환
// 비즈니스 로직은 서비스에 있으므로 여기는 최소한의 코드만.
// ──────────────────────────────────────────

export async function GET(request: NextRequest) {
  const contentsType =
    request.nextUrl.searchParams.get("contentsType") ?? "1";

  const result = await getClassMeta(contentsType);

  if (!result) {
    return NextResponse.json(
      { error: "해당 콘텐츠 타입의 데이터가 없습니다" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
