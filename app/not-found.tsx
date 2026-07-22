import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0f]">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-[#f59e0b] mb-4">404</p>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-[#64748b] mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#f59e0b] text-black font-semibold rounded-lg hover:bg-[#d97706] transition-colors"
        >
          Return Home
        </Link>
      </div>
    </main>
  )
}
