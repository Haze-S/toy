"use client";

// ──────────────────────────────────────────
// 콘텐츠 타입 탭 (클라이언트 컴포넌트)
//
// "use client"가 필요한 이유:
// - useRouter로 URL을 변경해야 함 (브라우저 API)
// - 서버 컴포넌트에서는 브라우저 API를 쓸 수 없음
//
// 탭을 클릭하면 ?contentsType=20 같은 쿼리파라미터를 바꾸고,
// Next.js가 서버 컴포넌트를 다시 렌더링해서 새 데이터를 보여줌.
// SPA처럼 부드럽게 전환되면서도 SSR의 이점을 유지.
// ──────────────────────────────────────────

import { useRouter, useSearchParams } from "next/navigation";
import { RANKING_CONTENTS_TYPES } from "@/lib/constants";

export default function ContentsTypeTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("contentsType") ?? "1";

  return (
    <nav className="flex gap-2 flex-wrap">
      {Object.entries(RANKING_CONTENTS_TYPES).map(([id, name]) => (
        <button
          key={id}
          onClick={() => router.push(`?contentsType=${id}`)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            id === current
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
              : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
          }`}
        >
          {name}
        </button>
      ))}
    </nav>
  );
}
