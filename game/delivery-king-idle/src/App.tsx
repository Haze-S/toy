import { useGameStore } from './store/gameStore';
import { useGameTick } from './hooks/useGameTick';
import { getBike } from './game/bikes';

const BIKE_EMOJI: Record<string, string> = {
  bicycle: '🚲',
  kickboard: '🛹',
  'e-kickboard': '🛴',
  scooter: '🛵',
  motorcycle: '🏍️',
  'e-bike': '⚡',
  'premium-motorcycle': '🏍️',
  superbike: '🚀',
};

function formatMoney(amount: number): string {
  if (amount >= 1_000_000_000_000) {
    return `${(amount / 1_000_000_000_000).toFixed(2)}조`;
  }
  if (amount >= 100_000_000) {
    return `${(amount / 100_000_000).toFixed(2)}억`;
  }
  if (amount >= 10_000) {
    return `${(amount / 10_000).toFixed(2)}만`;
  }
  return `${Math.floor(amount).toLocaleString()}`;
}

function App() {
  useGameTick();

  const money = useGameStore(state => state.money);
  const currentBikeId = useGameStore(state => state.currentBikeId);
  const incomePerSecond = useGameStore(state => state.incomePerSecond);

  const bike = getBike(currentBikeId);
  const emoji = BIKE_EMOJI[currentBikeId] ?? '🛵';
  const ips = incomePerSecond();

  return (
    <div className="flex flex-col h-dvh">
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 gap-2">
        <p className="text-6xl">{emoji}</p>
        <p className="text-gray-400 text-sm">{bike.name}</p>
      </div>
      <div className="p-4 text-center">
        <p className="text-2xl font-bold">💰 {formatMoney(money)}원</p>
        <p className="text-sm text-gray-400">⚡ {formatMoney(ips)}원 / sec</p>
      </div>
      <div className="p-4 bg-gray-900">
        <p className="text-gray-500 text-center">업그레이드 준비 중...</p>
      </div>
    </div>
  )
}

export default App
