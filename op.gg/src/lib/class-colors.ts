// 직업별 고유 컬러
// Tailwind 클래스가 아닌 hex값을 쓰는 이유:
// 동적으로 style에 넣어야 하는 경우(바 차트 width 등)가 있어서
// Tailwind의 JIT는 동적 클래스명을 감지 못함

export const CLASS_COLORS: Record<string, { bg: string; text: string }> = {
  검성: { bg: "#ef4444", text: "#fca5a5" },     // red
  수호성: { bg: "#3b82f6", text: "#93c5fd" },    // blue
  궁성: { bg: "#22c55e", text: "#86efac" },      // green
  살성: { bg: "#a855f7", text: "#d8b4fe" },      // purple
  정령성: { bg: "#06b6d4", text: "#67e8f9" },    // cyan
  마도성: { bg: "#f97316", text: "#fdba74" },     // orange
  치유성: { bg: "#eab308", text: "#fde047" },     // yellow
  호법성: { bg: "#ec4899", text: "#f9a8d4" },     // pink
};

export function getClassColor(className: string) {
  return CLASS_COLORS[className] ?? { bg: "#6b7280", text: "#d1d5db" };
}
