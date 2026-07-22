import { CheckCircle2, Clock, Gift } from 'lucide-react'

export function CTA() {
  return (
    <section
      className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border"
      style={{ background: '#0a0a0f' }}
    >
      <div className="max-w-[800px] mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Start your healing journey today
        </h2>
        <p className="text-muted-foreground max-w-[500px] mx-auto mb-10">
          Evidence-based guides created by relationship experts. Join thousands who have already
          transformed their lives.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="#product"
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Guides
          </a>
          <a
            href="#product"
            className="inline-flex items-center justify-center px-8 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors"
          >
            View Bundle
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 border-t border-border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">30-day guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Instant access</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Lifetime updates</span>
          </div>
        </div>
      </div>
    </section>
  )
}
