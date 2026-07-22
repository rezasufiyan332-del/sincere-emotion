export function ProductsError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0f0f18] to-[#0a0a0f]">
      <div className="max-w-7xl mx-auto text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#f43f5e]/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#f43f5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Failed to Load Products</h3>
        <p className="text-[#64748b] mb-6">Something went wrong while loading our guides.</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-[#f59e0b] text-black font-semibold rounded-lg hover:bg-[#d97706] transition-colors"
        >
          Try Again
        </button>
      </div>
    </section>
  )
}
