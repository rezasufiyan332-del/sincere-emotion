export function ProductsSkeleton() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0f0f18] to-[#0a0a0f]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="h-4 w-24 bg-[#1a1a24] rounded mx-auto mb-4 animate-pulse" />
          <div className="h-10 w-80 bg-[#1a1a24] rounded mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-96 bg-[#1a1a24] rounded mx-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6">
              <div className="h-40 bg-[#22222e] rounded mb-6 animate-pulse" />
              <div className="h-6 w-3/4 bg-[#22222e] rounded mb-2 animate-pulse" />
              <div className="h-4 w-1/2 bg-[#22222e] rounded mb-4 animate-pulse" />
              <div className="space-y-2 mb-6">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-[#22222e] rounded animate-pulse" />
                ))}
              </div>
              <div className="h-8 w-24 bg-[#22222e] rounded mb-4 animate-pulse" />
              <div className="h-12 bg-[#22222e] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
