import { ModernHeader } from '@/components/modern-header'
import { Hero } from '@/components/hero'
import { Products } from '@/components/products'
import { Testimonials } from '@/components/testimonials'
import { FAQ } from '@/components/faq'
import { CTA } from '@/components/cta'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <>
      <ModernHeader />
      <main>
        <Hero />
        <Products />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
