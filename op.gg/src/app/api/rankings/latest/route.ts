import { NextRequest, NextResponse } from "next/server";
import { getLatestRankings } from "@/features/ranking/ranking.service";

// GET /api/rankings/latest?contentsType=1&limit=100

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const contentsType = params.get("contentsType") ?? "1";
  const limit = Math.min(Number(params.get("limit") ?? 100), 100);

  const result = await getLatestRankings(contentsType, limit);

  if (!result) {
    return NextResponse.json(
      { error: "해당 콘텐츠 타입의 데이터가 없습니다" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
