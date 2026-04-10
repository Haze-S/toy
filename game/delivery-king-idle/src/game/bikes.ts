export interface Bike {
  id: string;
  name: string;
  price: number;
  baseIncome: number;
}

export const BIKES: Bike[] = [
  { id: 'bicycle', name: '자전거', price: 0, baseIncome: 1 },
  { id: 'kickboard', name: '킥보드', price: 30, baseIncome: 8 },
  { id: 'e-kickboard', name: '전동킥보드', price: 700, baseIncome: 50 },
  { id: 'scooter', name: '스쿠터', price: 15_000, baseIncome: 300 },
  { id: 'motorcycle', name: '오토바이', price: 350_000, baseIncome: 2_000 },
  { id: 'e-bike', name: '전기바이크', price: 10_000_000, baseIncome: 15_000 },
  { id: 'premium-motorcycle', name: '고급 오토바이', price: 500_000_000, baseIncome: 120_000 },
  { id: 'superbike', name: '슈퍼바이크', price: 20_000_000_000, baseIncome: 1_000_000 },
];

export function getBike(id: string): Bike {
  return BIKES.find(b => b.id === id)!;
}
