'use client'

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, -apple-system, sans-serif', backgroundColor: '#0a0a0f', color: '#f8fafc' }}>
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Application Error</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              A critical error occurred. Please refresh the page.
            </p>
            <button
              onClick={() => unstable_retry()}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f59e0b', color: 'black', fontWeight: 600, borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              Refresh Page
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
