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
