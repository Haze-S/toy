# 배달왕 키우기 (Delivery King Idle)

## 기술 스택
- React + TypeScript + Vite
- Zustand (상태 관리)
- Tailwind CSS
- localStorage (저장)
- Node 24 + npm 11 (로컬 개발)

## 언어 규칙
- 코드: 영어 (변수명, 함수명)
- 커밋 메시지: 한국어
- 문서 (docs/): 영어
- 커뮤니케이션: 한국어

## 폴더 구조
```
src/
├── game/        # game logic (bikes, gameLoop, economy, prestige)
├── store/       # Zustand store
├── components/  # React components
├── hooks/       # custom hooks
└── ads/         # ad integration
```

## 컨벤션
- 컴포넌트: PascalCase (파일명 + 이름)
- 함수/변수: camelCase
- 게임 데이터 상수: UPPER_SNAKE_CASE
- 기타 파일: camelCase

## 주요 문서
- `docs/game-design.md` — 게임 기획서 (밸런스 테이블, 공식, 시스템 상세)
- `docs/blog-post/` — 블로그 포스트 (Claude로 구현~배포 과정 기록)

## 블로그 포스트 규칙
- 각 MVP 단계가 완료될 때마다 `docs/blog-post/` 에 해당 단계의 포스트를 작성한다
- 파일명: `NN-제목.md` (예: `00-기획.md`, `01-프로젝트-세팅.md`)
- 언어: 한국어
- 내용 요구사항:
  - 전문적이고 기술적인 고민 흔적이 보여야 함
  - 대체 가능한 기술/방식이 있으면 비교하고 선택 이유를 반드시 포함
  - 포스팅 하나로 충분한 분량 (짧지 않게)
  - Claude와 협업한 과정도 자연스럽게 녹여낼 것

## MVP 개발 단계
1. 프로젝트 세팅 (Vite + React + TS + Tailwind + Zustand)
2. Zustand store + 자동 tick loop + 돈 증가
3. 탈것 데이터 + 교체 시스템
4. 탈것 강화 시스템
5. 업그레이드 UI
6. 라이더 애니메이션
7. 저장 시스템 (localStorage)
8. 오프라인 보상
9. 프레스티지 (배달 회사 설립)
10. 보상형 광고 연동
