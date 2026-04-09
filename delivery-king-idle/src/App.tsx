function App() {
  return (
    <div className="flex flex-col h-dvh">
      <div className="flex-1 flex items-center justify-center bg-gray-800">
        <p className="text-4xl">🛵</p>
      </div>
      <div className="p-4 text-center">
        <p className="text-2xl font-bold">💰 0원</p>
        <p className="text-sm text-gray-400">⚡ 1원 / sec</p>
      </div>
      <div className="p-4 bg-gray-900">
        <p className="text-gray-500 text-center">업그레이드 준비 중...</p>
      </div>
    </div>
  )
}

export default App
