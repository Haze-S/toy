# Meta Analysis Service - 시스템 설계 문서

> 최초 작성: 2026-02-20
> 대상 서비스: 아이온2 한국 서버 메타 분석 (향후 타 게임 확장 가능 구조)

---

## 프로젝트 개요

공식 랭킹 API 데이터를 기반으로 상위 랭커 100명의 빌드와 직업별 메타 변화를 분석하여 제공하는 웹 서비스.

**MVP 범위:**
- 메타 분석 기능만 구현
- 로그인/회원가입 없음 (개인정보 수집 없음)
- 커뮤니티 기능 없음
- 한국 서버 전용 (Phase 1)

**향후 확장 예정:**
- 필드보스 알람
- 시세 분석
- 타 게임 지원

---

## 1. 전체 시스템 아키텍처

```
[공식 랭킹 API (공개)]
         ↓  HTTP 요청 (Cron 스케줄)
[Collector Service]  ←→  [Redis: 중복방지 / rate limit / 캐시]
         ↓
[PostgreSQL: 스냅샷 누적 저장]
         ↓
[Analysis Layer: 집계 쿼리 / 통계 계산]
         ↓
[Next.js API Routes: /api/...]
         ↓
[Next.js Pages: SSR + ISR + CSR 혼합]
         ↓
[사용자 브라우저]
```

**핵심 원칙:**
- Collector가 API를 호출해 Top 100 랭커 데이터를 DB에 스냅샷 저장
- API Routes가 DB를 집계 쿼리로 분석 후 응답
- Redis가 반복적인 집계 쿼리를 캐싱 (무거운 집계 쿼리 보호)
- Next.js SSR로 초기 렌더링, CSR로 인터랙션 처리

---

## 2. 폴더 구조

```
src/
├── app/                        # Next.js App Router
│   ├── (meta)/                 # 메타 분석 페이지 그룹
│   │   ├── classes/[class]/    # 직업별 메타 페이지 (SSR + ISR)
│   │   └── rankings/           # 랭킹 페이지 (SSR)
│   ├── api/                    # API Routes (얇은 레이어)
│   │   ├── meta/
│   │   │   ├── classes/
│   │   │   └── trend/
│   │   ├── rankings/
│   │   │   ├── latest/
│   │   │   └── history/
│   │   └── stats/
│   │       └── guilds/
│   ├── layout.tsx
│   └── page.tsx
│
├── features/                   # 도메인별 비즈니스 로직
│   ├── ranking/
│   │   ├── ranking.service.ts  # 랭킹 조회/분석
│   │   └── ranking.types.ts
│   ├── character/
│   │   ├── character.service.ts
│   │   └── character.types.ts
│   └── meta/
│       ├── meta.service.ts     # 직업별 메타 집계
│       └── meta.types.ts
│
├── collector/                  # 데이터 수집 전용 (독립 프로세스)
│   ├── index.ts                # 진입점 (cron 실행)
│   ├── ranking-api.client.ts   # 공식 API 래퍼 (게임 무관 인터페이스)
│   ├── jobs/
│   │   ├── ranking.job.ts      # 랭킹 수집 작업
│   │   └── character.job.ts    # 캐릭터 상세 수집
│   └── scheduler.ts            # node-cron 설정
│
├── lib/                        # 공유 인프라
│   ├── db.ts                   # Prisma client 싱글톤
│   ├── redis.ts                # Redis client 싱글톤
│   ├── cache.ts                # 캐시 헬퍼 (get/set/invalidate)
│   └── constants.ts            # 직업 목록, rankingType 등 상수
│
└── components/                 # UI 컴포넌트
    ├── ui/                     # 범용 컴포넌트 (Button, Card 등)
    └── meta/                   # 메타 분석 전용 컴포넌트

prisma/
├── schema.prisma
└── migrations/

.env.example                    # 환경변수 템플릿 (커밋)
.env.local                      # 실제 환경변수 (.gitignore)
docker-compose.yml              # 로컬 개발용 DB
```

**구조 원칙:**
- `features/` — 도메인 로직의 실체. API Routes는 여기를 호출하는 얇은 레이어
- `collector/` — 수집 로직 완전 분리. 나중에 별도 서버/컨테이너로 분리 가능
- `lib/` — DB/Redis 클라이언트는 싱글톤으로 관리
- `ranking-api.client.ts` — 게임 종류와 무관한 인터페이스로 설계 (게임별 구현체로 확장 가능)

---

## 3. DB 설계

### 테이블 정의

```sql
-- 랭킹 수집 세션 (언제 어떤 타입을 수집했는가)
ranking_collections
  id              BIGSERIAL PRIMARY KEY
  game_id         VARCHAR(50) NOT NULL DEFAULT 'aion2'  -- 타 게임 확장 대비
  server          VARCHAR(20) NOT NULL DEFAULT 'KR'
  ranking_type    VARCHAR(50) NOT NULL   -- 'total', 'pvp', 'siege' 등
  contents_type   VARCHAR(50)            -- 콘텐츠 세부 구분
  total_count     INT
  collected_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- 각 수집 시점의 랭킹 스냅샷
ranking_snapshots
  id              BIGSERIAL PRIMARY KEY
  collection_id   BIGINT NOT NULL REFERENCES ranking_collections(id)
  rank            INT NOT NULL
  character_name  VARCHAR(100) NOT NULL
  class_name      VARCHAR(50) NOT NULL
  level           INT
  guild_name      VARCHAR(100)
  score           BIGINT
  raw_data        JSONB   -- API 원본 전체 보존 (스키마 변경 시 마이그레이션 최소화)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- 캐릭터별 상세 스냅샷 (장비, 스탯 등)
character_snapshots
  id              BIGSERIAL PRIMARY KEY
  collection_id   BIGINT REFERENCES ranking_collections(id)
  character_name  VARCHAR(100) NOT NULL
  class_name      VARCHAR(50) NOT NULL
  level           INT
  equipment       JSONB   -- 장비 슬롯별 아이템 정보
  stats           JSONB   -- 주요 스탯
  skills          JSONB   -- 스킬 세팅
  raw_data        JSONB
  snapshot_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- [확장 예정] 필드보스
field_boss_schedules
  id              BIGSERIAL PRIMARY KEY
  game_id         VARCHAR(50) NOT NULL DEFAULT 'aion2'
  boss_name       VARCHAR(100)
  spawn_at        TIMESTAMPTZ
  status          VARCHAR(20)   -- 'upcoming', 'alive', 'dead'

-- [확장 예정] 시세
market_prices
  id              BIGSERIAL PRIMARY KEY
  game_id         VARCHAR(50) NOT NULL DEFAULT 'aion2'
  item_id         VARCHAR(100)
  item_name       VARCHAR(200)
  price           BIGINT
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### 인덱스 전략

```sql
-- 핵심 쿼리: "최신 수집의 직업별 분포"
CREATE INDEX idx_ranking_snapshots_collection_class
  ON ranking_snapshots(collection_id, class_name);

-- 캐릭터 이름 기반 히스토리 조회
CREATE INDEX idx_ranking_snapshots_character_name
  ON ranking_snapshots(character_name);

-- 최신 수집 조회 (수집 세션 목록)
CREATE INDEX idx_ranking_collections_collected_at
  ON ranking_collections(collected_at DESC);

-- 직업별 캐릭터 상세 최신순
CREATE INDEX idx_character_snapshots_name_time
  ON character_snapshots(character_name, snapshot_at DESC);
```

**설계 포인트:**
- `raw_data JSONB` — API 응답 전체 보존. 필드 추가 시 마이그레이션 없이 활용 가능
- `ranking_collections` 로 수집 세션 분리 — "이 100명은 같은 시점에 수집됨" 보장
- 삭제 없음, 스냅샷 누적 방식 — 시계열 메타 분석 가능
- `game_id` 필드 — 타 게임 확장 시 동일 테이블 재사용 가능

---

## 4. 데이터 수집 전략

### rankingType / contentsType 구조

```
rankingType
├── total       — 종합 랭킹
├── pvp         — PvP 랭킹
├── siege       — 공성 랭킹
└── (추후 추가)

contentsType (rankingType별 세부 구분)
└── pvp
    ├── arena
    └── openworld
```

수집 작업은 `(game_id, rankingType, contentsType)` 조합 단위로 독립 실행.

### 수집 빈도

| | 하루 1회 | 6시간마다 |
|---|---|---|
| API 호출 비용 | 낮음 | 4배 |
| 메타 변화 감지 | 패치 단위 | 일중 변화 감지 |
| DB 용량 | 작음 | 4배 |

**MVP 결정: 하루 1회 (새벽 3시)**
- 아이온2 메타는 패치 단위로 변하므로 일별 스냅샷으로 충분
- 안정화 후 6시간으로 전환 가능 (cron 표현식만 수정)

### 수집 흐름

```
1. scheduler.ts → ranking.job.ts 실행
2. ranking-api.client.ts → 공식 API 호출 → Top 100 응답
3. ranking_collections 행 생성 (세션 기록)
4. ranking_snapshots 100행 bulk insert
5. Redis "마지막 수집 시각" 갱신
6. (2단계) character.job.ts → 각 캐릭터 상세 API 호출 (rate limit 주의)
   → character_snapshots 저장
```

---

## 5. API 설계

### 엔드포인트

```
GET /api/rankings/latest
  Query: rankingType, contentsType
  → 가장 최근 수집의 Top 100 랭킹
  Cache: Redis 10분

GET /api/rankings/history
  Query: characterName, limit=30
  → 특정 캐릭터의 랭킹 변화 이력
  Cache: Redis 30분

GET /api/meta/classes
  → 최신 스냅샷 기준 직업별 점유율 통계
  Response: [{ className, count, ratio, avgRank, avgScore }]
  Cache: Redis 30분

GET /api/meta/classes/[className]
  → 특정 직업 상세 메타 (해당 직업 캐릭터 목록 + 통계)
  Cache: Redis 30분

GET /api/stats/guilds
  → 상위 랭커 내 길드 점유율
  Cache: Redis 30분

GET /api/meta/trend
  Query: days=7, className
  → 직업별 메타 변화 추이 (최근 N회 수집 비교)
  Cache: Redis 1시간
```

### 응답 구조 (통일된 래퍼)

```typescript
{
  data: T,
  meta: {
    snapshotAt: string,    // 데이터 기준 시각 (수집 시각)
    collectionId: number,
    cachedAt: string       // 캐시 생성 시각
  }
}
```

---

## 6. SSR / CSR 전략

### SSR이 필요한 이유

**SEO:** "아이온2 직업 메타", "아이온2 랭킹" 등 검색 키워드로 유입되려면
초기 HTML에 데이터가 포함되어야 함. CSR만 쓰면 크롤러가 빈 페이지를 봄.

**OG/SNS 공유:** 카카오톡/디스코드 공유 시 미리보기에 메타 데이터 포함 필요.

### 페이지별 전략

| 페이지 | 전략 | 이유 |
|---|---|---|
| `/` 메인 | SSR | SEO, 초기 로드 속도 |
| `/classes/[class]` | SSR + ISR (1시간) | SEO 핵심 페이지 |
| `/rankings` | SSR | SEO |
| 필터/정렬 인터랙션 | CSR (SWR) | 사용자 인터랙션 |

---

## 7. 기술 스택 선택 이유

| 기술 | 선택 이유 |
|---|---|
| **TypeScript** | 프론트-백 타입 공유로 API 불일치 방지 |
| **Next.js** | SSR/ISR 내장, API Routes로 별도 서버 불필요, Vercel 무료 배포 |
| **PostgreSQL** | JSONB 인덱싱, 윈도우 함수(랭킹 집계), 시계열 쿼리 지원 |
| **Prisma** | TypeScript 친화적 ORM, 마이그레이션 관리 |
| **Redis** | 집계 쿼리 캐싱, 수집 중복 방지, 향후 실시간 기능 확장 |
| **node-cron** | 외부 인프라 없이 Node.js 내에서 스케줄링 |

**Spring이 아닌 이유:** JVM 기동 오버헤드, 보일러플레이트 과중, 프론트와 타입 공유 불가
**FastAPI가 아닌 이유:** Python 환경 별도 관리, Next.js와 언어 불일치, 이 서비스는 데이터 분석보다 웹 표시가 핵심

---

## 8. 환경변수

```bash
# .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/meta_analysis"
REDIS_URL="redis://localhost:6379"

# 게임 API (게임별로 다른 값 설정)
RANKING_API_BASE_URL=""
RANKING_API_KEY=""

# 수집 스케줄
COLLECTOR_CRON="0 3 * * *"   # 매일 새벽 3시

NODE_ENV="development"
```

---

## 9. 개발 우선순위 (MVP)

```
Phase 1 - 핵심
  1. Prisma 스키마 확정 + 마이그레이션
  2. ranking-api.client.ts 구현 (공식 API 연동 테스트)
  3. Collector 구현 + 1회 수동 실행 테스트
  4. /api/meta/classes API 구현
  5. 메인 페이지 + 직업별 메타 페이지 SSR 구현

Phase 2 - 안정화
  - Redis 캐싱 적용
  - Cron 자동 실행
  - 에러 핸들링 + 수집 실패 알림 (디스코드 웹훅 등)
  - Google AdSense 삽입

Phase 3 - 확장
  - 필드보스 알람 구조 추가
  - 시세 분석 기초 구조 추가
  - 타 게임 지원 (game_id 분기)
```

---

## 10. 로컬 개발 환경 세팅

```bash
# 1. 의존성 설치
npm install

# 2. 로컬 DB 실행
docker-compose up -d

# 3. DB 마이그레이션
npx prisma migrate dev --name init

# 4. 개발 서버
npm run dev

# 5. 수집 수동 실행 (테스트용)
npm run collect
```
