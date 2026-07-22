'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Will these guides actually help if my attachment wounds run deep?',
    answer:
      'Yes. These guides are based on attachment theory research and address the root causes of anxious, avoidant, and secure patterns. They don\'t just offer surface-level advice — they guide you through understanding why you respond the way you do in relationships, then provide practical frameworks to shift those patterns. Real transformation takes time, but the tools work. Many of our readers report significant shifts within 2-3 weeks of consistent work.',
  },
  {
    question: "What if I'm scared to face my patterns? What if healing feels too vulnerable?",
    answer:
      "That fear is part of the pattern itself, and it's completely valid. The guides meet you where you are. They start with gentle self-awareness work before moving into deeper healing. You control the pace. There's no rush, no pressure, no judgment. The vulnerability you feel is actually a sign that real healing is possible — it means you're willing to look honestly at your wounds. That takes courage, and we honor that.",
  },
  {
    question: 'How is this different from just reading a therapy book?',
    answer:
      'These guides combine attachment theory with practical, actionable exercises you can implement immediately. Rather than just understanding the concept of secure attachment, you\'ll learn specific techniques to: calm your nervous system when triggered, stop pursuing unavailable partners, recognize your attachment patterns in real-time, and rebuild self-trust. They\'re designed for someone who wants both knowledge AND transformation.',
  },
  {
    question: "Can I use these guides even if I'm in a relationship right now?",
    answer:
      'Absolutely. In fact, many people find the guides most valuable while in a relationship because you can see your patterns play out in real time. You\'ll understand why you react the way you do, why your partner might withdraw or pursue, and how to create secure attachment together. Some couples work through the guides side-by-side and report feeling closer and more secure as a result.',
  },
  {
    question: 'What happens after I finish a guide? Do I need to buy more?',
    answer:
      'The guides are designed to be used and re-used. Many readers work through them multiple times, each pass revealing deeper insights. We also offer ongoing support through email and community access so you can continue your healing journey. The bundles are one-time purchases with lifetime access and free updates as our research evolves.',
  },
]

function FAQItem({
  faq,
  idx,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[number]
  idx: number
  isOpen: boolean
  onToggle: () => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [isOpen])

  return (
    <div
      className={`border-b border-border ${isOpen ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${idx}`}
        id={`faq-question-${idx}`}
      >
        <span className="text-base font-semibold text-white pr-4 group-hover:text-primary transition-colors">
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}
        />
      </button>
      <div
        id={`faq-answer-${idx}`}
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
        role="region"
        aria-labelledby={`faq-question-${idx}`}
        style={{ height: isOpen ? height : 0 }}
      >
        <div ref={contentRef} className="pb-5 text-muted-foreground leading-relaxed">
          {faq.answer}
        </div>
      </div>
    </div>
  )
}

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0f0f18' }}>
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Questions &amp; Answers</h2>
        </div>

        <div>
          {faqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              faq={faq}
              idx={idx}
              isOpen={openIdx === idx}
              onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-3">Still have questions?</p>
          <a
            href="mailto:support@sincereemotion.com"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Get in touch &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
