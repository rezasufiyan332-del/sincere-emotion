'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('Route error:', error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0f]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#f43f5e]/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#f43f5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Something Went Wrong</h1>
        <p className="text-[#64748b] mb-8">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={() => unstable_retry()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#f59e0b] text-black font-semibold rounded-lg hover:bg-[#d97706] transition-colors"
        >
          Try Again
        </button>
      </div>
    </main>
  )
}
