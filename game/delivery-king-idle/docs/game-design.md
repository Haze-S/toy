# Game Design Document — 배달왕 키우기 (Delivery King Idle)

## Overview
Fully automated idle game. A delivery rider earns money automatically. Players upgrade vehicles to increase income.
Goal: App store release → Ad monetization

## Art Style
- Pixel art or hand-drawn/doodle style
- Cute but absurd (병맛/B-grade humor)
- MVP: Emoji/SVG + CSS animation → replace with real assets later

## Core Systems

### 1. Auto Income
- Starts immediately on game launch
- `money += incomePerSecond * deltaTime`
- Income is affected by: current vehicle, enhancement level, prestige multiplier, ad boost

### 2. Vehicle Swap (탈것 교체)
Big income jumps. Player buys a new vehicle to replace the current one.

| # | id | Name | Price | Income/sec | Time to buy (no enhance) |
|---|-----|------|------|---------|----------|
| 1 | bicycle | 자전거 | 0 | 1 | Instant |
| 2 | kickboard | 킥보드 | 30 | 8 | ~30s |
| 3 | e-kickboard | 전동킥보드 | 700 | 50 | ~1.5min |
| 4 | scooter | 스쿠터 | 15,000 | 300 | ~5min |
| 5 | motorcycle | 오토바이 | 350,000 | 2,000 | ~19min |
| 6 | e-bike | 전기바이크 | 10,000,000 | 15,000 | ~1.4hr |
| 7 | premium-motorcycle | 고급 오토바이 | 500,000,000 | 120,000 | ~9hr |
| 8 | superbike | 슈퍼바이크 | 20,000,000,000 | 1,000,000 | ~46hr |

### 3. Vehicle Enhancement (탈것 강화)
Incremental upgrades on the same vehicle. Repeatable, diminishing returns.

- **Cost formula:** `baseIncome × 10 × (1.15 ^ level)`
- **Income formula:** `baseIncome × (1 + 0.1 × level)`
- **Max level:** None (cost acts as natural wall)
- **First enhance ROI:** Always ~100s → worsens per level

Decision point: "Enhance current vehicle?" vs "Save for next vehicle?"

### 4. Prestige (환생 — 배달 회사 설립)

| Item | Value |
|------|-------|
| Unlock | Purchase superbike (vehicle #8) |
| Resets | Money, vehicle, all enhancement levels |
| Keeps | Prestige count, permanent multiplier |
| Multiplier | `1 + (0.5 × prestigeCount)` |

| Prestige # | Multiplier |
|------------|------------|
| 0 | ×1.0 |
| 1 | ×1.5 |
| 2 | ×2.0 |
| 5 | ×3.5 |
| 10 | ×6.0 |

Run time estimates:
- 1st run: ~2-3 days
- 2nd run: ~1.5-2 days (×1.5)
- 3rd run: ~1 day (×2.0)
- 5th+: Half day → prestige becomes routine

### 5. Offline Rewards
- `offlineTime = now - lastSaveTime`
- `money += incomePerSecond * offlineTime`

### 6. Ads (3 types)

| Type | Effect | Cooldown |
|------|--------|----------|
| Rewarded (income boost) | Income ×2 for 120s | 5 min |
| Offline reward | Offline income ×2 | Once per app re-entry |
| Interstitial | None (revenue only) | Every 3 upgrades |

MVP includes rewarded ads only. Other types in Phase 2.

## Player Journey
```
0~2min    bicycle → kickboard → e-kickboard (HOOK)
2~30min   scooter → motorcycle, learn enhancement
30min~2hr e-bike, use ad boost
2hr~1day  premium motorcycle, feel offline rewards
1~3days   superbike → "배달 회사 설립" unlocked!
3days+    prestige loop, each run faster
```

## Data Structures

### Player State
- money: number
- incomePerSecond: number (computed)
- currentBikeId: string
- bikeLevel: number (enhancement level)
- prestigeCount: number
- prestigeMultiplier: number (computed from prestigeCount)
- lastSaveTime: number (timestamp)
- adBoostEndTime: number (timestamp, 0 if inactive)

### Bike Definition
- id: string
- name: string
- price: number
- baseIncome: number

## Future Phases (Post-MVP)
- Phase 2: Offline reward ad + Interstitial ad
- Phase 3: Gift card exchange
- Phase 4: GPS CashRide (real movement rewards)
