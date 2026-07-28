import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatINR, paiseToRupees } from '@/lib/utils'
import type { Metadata } from 'next'
import { AddToCartButton } from './add-to-cart-button'
import { CheckCircle2, Shield, Star, Download, Users, Heart } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug } })
  if (!product) return { title: 'Product Not Found — Sincere Emotion' }
  return {
    title: `${product.title} — Sincere Emotion`,
    description: product.subtitle || product.description.slice(0, 160),
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug } })
  if (!product || !product.isActive) return notFound()

  const price = paiseToRupees(product.price)
  const originalPrice = paiseToRupees(product.originalPrice ?? product.price)
  const savings = originalPrice - price

  // Product-specific content map
  const productContent: Record<string, {
    heroTitle: string
    heroSubtitle: string
    painPoints: string[]
    benefits: string[]
    learnItems: string[]
    testimonial: { name: string; age: string; quote: string; result: string }
    ctaText: string
  }> = {
    'stop-chasing-start-choosing': {
      heroTitle: "You've been waiting for them to change. What if you changed first?",
      heroSubtitle: "A 7-Day Guide to Healing Your Attachment Wounds",
      painPoints: [
        "You care deeply, but they keep pulling away, leaving you hurt and confused",
        "You replay every conversation, wondering what you did wrong",
        "You feel like you're the only one holding the relationship together",
        "You long for connection, but instead you feel pushed away",
        "You wonder: Is this love worth it? Or am I just chasing someone who may never choose me?"
      ],
      benefits: [
        "Understand Why They Pull Away — and why it's NOT your fault",
        "Stop the Overthinking — practical tools to quiet your anxious mind",
        "Learn Communication Scripts — word-for-word scripts that work",
        "Regulate Your Nervous System — body-based techniques in 10 minutes",
        "Know When to Stay (and When to Walk Away)"
      ],
      learnItems: [
        "Why anxious-avoidant cycles form and how to break them",
        "The 4-7-8 breathing technique to calm anxiety instantly",
        "How to express your needs without feeling needy",
        "The relationship audit exercise for clarity",
        "Your 7-day action plan for immediate relief"
      ],
      testimonial: {
        name: "Sarah M.",
        age: "31",
        quote: "I spent eight years chasing emotionally unavailable men. Within three weeks of these exercises, I stopped obsessing. Two months in, I found someone secure and realized what healthy actually feels like.",
        result: "Ended 8-year cycle of chasing unavailable partners"
      },
      ctaText: "Start Healing Now — $9"
    },
    'the-anxious-heart': {
      heroTitle: "Stop feeling 'too much' in every relationship. Finally, feel safe in love.",
      heroSubtitle: "Your Complete Guide to Overcoming Relationship Anxiety",
      painPoints: [
        "You give your heart, show up, stay patient — and still feel like you're not enough",
        "They shut down, pull away, go quiet when you need them most",
        "You're not needy. You're just tired of feeling invisible",
        "You wonder: Is it me? Am I asking for too much? Is this love breaking me down?",
        "If this is your daily inner monologue, you're not alone"
      ],
      benefits: [
        "Understand Your Attachment Wounds — where your anxiety really comes from",
        "Calm Your Nervous System — practical regulation tools for real life",
        "Rewrite Anxious Thought Patterns — cognitive techniques that work",
        "Master Communication — speak your truth without fear",
        "Build Secure Relationships — attract the love you deserve"
      ],
      learnItems: [
        "The complete science of anxious attachment (Chapters 1-5)",
        "How childhood wounds shape adult relationships (Chapters 6-10)",
        "Breaking the anxious-avoidant cycle (Chapters 11-15)",
        "Advanced regulation and communication skills (Chapters 16-25)",
        "Your 30-day healing plan with daily practices (Chapters 26-30)"
      ],
      testimonial: {
        name: "Emma R.",
        age: "34",
        quote: "I spent years thinking I was 'too much.' This book helped me see my pattern: I abandoned myself first, so I felt perpetually abandoned. Once I learned self-loyalty, everything shifted. My relationships are now calm, not chaotic.",
        result: "Stopped self-abandonment, became securely attached"
      },
      ctaText: "Heal Your Anxious Heart — $29"
    },
    'attachment-mastery': {
      heroTitle: "The definitive system for secure, healthy relationships — whether you're anxious, avoidant, or confused",
      heroSubtitle: "50 Chapters of Evidence-Based Healing",
      painPoints: [
        "You've tried everything — therapy, books, self-work — but your relationships still feel hard",
        "You understand attachment theory, but you don't know how to LIVE differently",
        "You're tired of short-term fixes that don't create lasting change",
        "You're ready for a complete system, not another quick read"
      ],
      benefits: [
        "Complete Attachment Blueprint — all three styles, all patterns, all solutions",
        "50 Chapters of Deep Work — foundation to mastery, step by step",
        "The 90-Day Mastery Plan — turn knowledge into lasting change",
        "Advanced Communication & Boundary Scripts — for every situation",
        "Relationship Audit + Guided Journal — tools for ongoing growth"
      ],
      learnItems: [
        "The neuroscience of attachment — how your brain was wired",
        "Anxious, avoidant, and disorganized styles in depth",
        "Breaking the pursuer-withdrawer dynamic for good",
        "The SCRIPT communication framework (advanced)",
        "Conflict resolution, repair conversations, and boundary setting"
      ],
      testimonial: {
        name: "Marcus T.",
        age: "36",
        quote: "I didn't expect to relate to this book as much as I did. I saw myself in every page — the anxiety, the confusion, the constant self-doubt. It helped me stop trying to 'fix it' and start understanding what I actually need.",
        result: "Transformed from defensive withdrawal to genuine presence"
      },
      ctaText: "Get Attachment Mastery — $39"
    },
    'the-complete-healing-collection': {
      heroTitle: "Everything you need to heal your attachment wounds. Save 40%.",
      heroSubtitle: "All 3 Guides + Bonus Materials",
      painPoints: [
        "You don't know where to start — which guide is right for you?",
        "You want the complete journey, not just one piece",
        "You're serious about healing and want everything"
      ],
      benefits: [
        "All 3 Books in One Collection — $196+ pages of transformation",
        "Guided Journal Prompts — weekly prompts for 6 weeks of growth",
        "Communication Scripts — word-for-word scripts for every scenario",
        "Relationship Audit Worksheet — measure your progress",
        "Save 40% vs. buying individually — $90+ in savings"
      ],
      learnItems: [
        "7-Day Quick Start: Stop Chasing, Start Choosing ($9 value)",
        "Complete Guide: The Anxious Heart (30 chapters, $29 value)",
        "Definitive Guide: Attachment Mastery (50 chapters, $39 value)",
        "Bonus: Communication Scripts + Journal Prompts + Audit Worksheets"
      ],
      testimonial: {
        name: "Jenna K.",
        age: "29",
        quote: "This bundle felt like someone finally put words to everything I couldn't explain. I cried, highlighted every page, and finally felt like I wasn't crazy for wanting more.",
        result: "Found clarity after years of confusion"
      },
      ctaText: "Get the Complete Collection — $59"
    }
  }

  const content = productContent[slug] || {
    heroTitle: product.title,
    heroSubtitle: product.subtitle || 'Transform Your Relationships',
    painPoints: [
      'You feel stuck in relationships that leave you confused',
      'You want to understand your patterns and change them',
      'You deserve secure, fulfilling love'
    ],
    benefits: [
      'Expert guidance from attachment specialist Sophie',
      'Evidence-based techniques that actually work',
      'Practical exercises for real change'
    ],
    learnItems: [
      'Attachment theory fundamentals',
      'Practical healing techniques',
      'Communication and boundary skills'
    ],
    testimonial: {
      name: 'Reader',
      age: '',
      quote: 'This guide transformed my understanding of relationships.',
      result: 'Found clarity and peace'
    },
    ctaText: `Get ${product.title} — $${price}`
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section with Pain Hook */}
      <section className="relative px-4 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/5 via-transparent to-[#8b5cf6]/5" />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-[#f59e0b] mb-4">
            {slug === 'the-complete-healing-collection' ? 'Best Value Bundle' : 'New Release'}
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-[#f8fafc] mb-6 leading-tight">
            {content.heroTitle}
          </h1>
          <p className="text-xl sm:text-2xl text-[#f59e0b]/80 mb-8">{content.heroSubtitle}</p>
          <p className="text-lg text-[#64748b] max-w-2xl mx-auto mb-10 leading-relaxed">
            {product.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <AddToCartButton productId={product.id} productName={product.title} productSubtitle={product.subtitle || undefined} productImage={product.coverImage || undefined} price={price} originalPrice={originalPrice} />
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-[#64748b]">
            <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Instant Download</span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4" /> 500+ Readers</span>
            <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> 30-Day Guarantee</span>
          </div>
        </div>
      </section>

      {/* "Does This Sound Like You?" Section */}
      <section className="py-16 px-4 bg-[#0f0f18]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f8fafc] mb-10 text-center">
            Does This Sound Like You? 💔
          </h2>
          <div className="space-y-4">
            {content.painPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-4 bg-[#1a1a24] border border-[#1e293b] rounded-xl p-5">
                <span className="text-lg text-[#f59e0b] font-bold">✔️</span>
                <p className="text-lg text-[#cbd5e1] leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-[#f59e0b] font-semibold text-lg">
              💔 If this resonates with you, know that you're not alone.
            </p>
          </div>
        </div>
      </section>

      {/* Sophie's Story Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1a1a24] border border-[#1e293b] rounded-2xl p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-[#0a0a0f]">S</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#f8fafc] mb-2">I Lived This. For Years.</h3>
                <p className="text-[#f59e0b] font-medium">— Sophie, Relationship Coach</p>
              </div>
            </div>
            <div className="space-y-4 text-[#cbd5e1] leading-relaxed">
              <p>I loved an avoidant partner for almost a decade — waiting for affection that rarely came, walking on eggshells, wondering what I did wrong. I thought if I just loved them harder, softer, better, they'd finally choose me.</p>
              <p>Instead, I lost myself. The turning point came when I stopped trying to earn love and started learning how to honor my own heart.</p>
              <p>I created this guide because I couldn't find anything that truly captured the anxiety, self-blame, and emotional rollercoaster I experienced. This is the book I wish I'd had.</p>
            </div>
            <div className="mt-6 pt-6 border-t border-[#1e293b]">
              <p className="text-[#64748b]">💛 I'm not here as a coach or expert. I'm someone who's lived it — deeply. And I share this for anyone who's ever felt anxious, unseen, or stuck in a love that hurts more than it heals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-16 px-4 bg-[#0f0f18]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f8fafc] mb-10 text-center">
            What You'll Discover Inside
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {content.learnItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-[#1a1a24] border border-[#1e293b] rounded-xl p-5">
                <span className="text-xl font-bold text-[#f59e0b] flex-shrink-0">0{i + 1}</span>
                <p className="text-[#cbd5e1] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f8fafc] mb-10 text-center">
            This Guide Will Help You
          </h2>
          <div className="space-y-4">
            {content.benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-4 bg-[#1a1a24] border border-[#1e293b] rounded-xl p-5">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-lg font-semibold text-[#f8fafc]">{benefit.split(' — ')[0]}</p>
                  {benefit.includes(' — ') && <p className="text-[#64748b] mt-1">{benefit.split(' — ')[1]}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 px-4 bg-[#0f0f18]">
        <div className="max-w-3xl mx-auto text-center">
          <Heart className="w-10 h-10 text-[#f59e0b] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f8fafc] mb-10">
            Real Story. Real Healing. ❤️‍🩹
          </h2>
          <div className="bg-[#1a1a24] border border-[#1e293b] rounded-2xl p-8 sm:p-12">
            <p className="text-lg sm:text-xl text-[#cbd5e1] italic leading-relaxed mb-6">
              "{content.testimonial.quote}"
            </p>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[#f59e0b] text-[#f59e0b]" />)}
            </div>
            <p className="text-[#f59e0b] font-bold">{content.testimonial.name}</p>
            <p className="text-[#64748b] text-sm mt-1">{content.testimonial.result}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f8fafc] mb-10 text-center">
            Questions & Answers
          </h2>
          <div className="space-y-4">
            {[
              { q: "I'm still in a relationship with an avoidant partner. Can I use this?",
                a: "Yes. These guides are designed to help you stop chasing and start choosing yourself, even while you're still together. You'll learn to respond with calm, clarity, and confidence instead of panic or overthinking." },
              { q: "What if I've already read about attachment styles? Will this still help?",
                a: "Absolutely. You probably already know why you feel anxious, but this guide helps you actually heal it. Each lesson teaches you how to calm your body, not just your thoughts." },
              { q: "How long does it take to see results?",
                a: `Most people begin to feel a real shift within the first few days. ${slug === 'stop-chasing-start-choosing' ? 'The 7-day format is designed for quick wins.' : slug === 'the-anxious-heart' ? 'The 30-day plan builds lasting change.' : slug === 'attachment-mastery' ? 'The 90-day plan ensures complete transformation.' : 'Each day takes about 10-15 minutes.'}` },
              { q: "What format are the guides in?",
                a: "All guides are digital (PDF format). You get instant access after purchase — no shipping, no waiting. You can read on any device." },
              { q: "What is your refund policy?",
                a: "We offer a 30-day money-back guarantee. If you don't find value, we'll refund your purchase — no questions asked." }
            ].map((faq, i) => (
              <details key={i} className="group bg-[#1a1a24] border border-[#1e293b] rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-[#f8fafc] font-semibold hover:bg-[#22222e] transition-colors">
                  {faq.q}
                  <span className="text-[#f59e0b] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-5 pt-0 border-t border-[#1e293b] mt-3">
                  <p className="text-[#cbd5e1] leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#1a1a24] via-[#0a0a0f] to-[#0a0a0f]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#1a1a24] border border-[#1e293b] rounded-2xl p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#f8fafc] mb-4">
              {slug === 'the-complete-healing-collection' ? 'Everything You Need to Heal' : 'Ready to Start Healing?'}
            </h2>
            <div className="flex items-baseline justify-center gap-3 mb-6">
              <span className="text-5xl font-bold text-[#f8fafc]">{formatINR(price)}</span>
              {originalPrice > price && (
                <>
                  <span className="text-2xl text-[#64748b] line-through">{formatINR(originalPrice)}</span>
                  <span className="text-lg text-emerald-500 font-semibold">Save {formatINR(savings)}</span>
                </>
              )}
            </div>
            <p className="text-[#64748b] mb-8 max-w-lg mx-auto">
              Instant access · 30-day guarantee · Lifetime updates · Read on any device
            </p>
            <AddToCartButton productId={product.id} productName={product.title} productSubtitle={product.subtitle || undefined} productImage={product.coverImage || undefined} price={price} originalPrice={originalPrice} />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-4 border-t border-[#1e293b]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#64748b]">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Secure Payment</div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> 30-Day Guarantee</div>
            <div className="flex items-center gap-2"><Download className="w-4 h-4" /> Instant Download</div>
            <div className="flex items-center gap-2"><Star className="w-4 h-4" /> Evidence-Based</div>
          </div>
        </div>
      </section>
    </div>
  )
}
