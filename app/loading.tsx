export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin" />
        <p className="text-[#64748b] text-sm">Loading...</p>
      </div>
    </main>
  )
}
