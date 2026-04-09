import { NextRequest, NextResponse } from "next/server";
import { getGuildStats } from "@/features/ranking/ranking.service";

// GET /api/stats/guilds?contentsType=1

export async function GET(request: NextRequest) {
  const contentsType =
    request.nextUrl.searchParams.get("contentsType") ?? "1";

  const result = await getGuildStats(contentsType);

  if (!result) {
    return NextResponse.json(
      { error: "해당 콘텐츠 타입의 데이터가 없습니다" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
