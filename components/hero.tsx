import { Check } from 'lucide-react'

const TRUST_ITEMS = [
  '30-day money-back guarantee',
  'Instant digital access',
  'Based on attachment theory',
] as const

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0f] to-[#0f0f1a] overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[800px] px-6 py-24 text-center">
        {/* Label */}
        <p className="hero-fade-in hero-delay-0 text-xs font-semibold uppercase tracking-[0.2em] text-[#f59e0b] mb-6">
          Evidence-based relationship guides
        </p>

        {/* Headline */}
        <h1 className="hero-fade-in hero-delay-1 text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-[#f8fafc] mb-6">
          Understanding your attachment style is the first step to healing.
        </h1>

        {/* Subheadline */}
        <p className="hero-fade-in hero-delay-2 text-base sm:text-lg leading-relaxed text-[#94a3b8] max-w-[600px] mx-auto mb-10">
          Practical, research-backed guides to help you break anxious patterns,
          build emotional safety, and create the secure relationships you deserve.
        </p>

        {/* CTA Buttons */}
        <div className="hero-fade-in hero-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <a
            href="#product"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-[#f59e0b] px-8 text-sm font-semibold text-[#0a0a0f] transition-all duration-200 hover:bg-[#d97706] hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]"
          >
            Browse Guides
          </a>
          <a
            href="#product"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-[#334155] px-8 text-sm font-semibold text-[#f8fafc] transition-all duration-200 hover:border-[#475569] hover:bg-white/5"
          >
            Learn More
          </a>
        </div>

        {/* Trust indicators */}
        <div className="hero-fade-in hero-delay-4 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm text-[#64748b]">
          {TRUST_ITEMS.map((item) => (
            <span key={item} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#f59e0b] shrink-0" strokeWidth={2.5} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-fade-in hero-delay-5 absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="scroll-bounce flex flex-col items-center gap-1 text-[#475569]">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  )
}
