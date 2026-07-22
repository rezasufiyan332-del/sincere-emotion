'use client'

import { motion } from 'framer-motion'
import { Star, BadgeCheck } from 'lucide-react'
import Image from 'next/image'
import { testimonials } from '@/lib/data/testimonials'

const stats = [
  { number: '3', label: 'Guides Available' },
  { number: '4.9★', label: 'Average Rating' },
  { number: '100%', label: 'Evidence-Based' },
]

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0f]"
    >
      <div className="max-w-[900px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-[#f59e0b] mb-4">
            Real Stories
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#f8fafc] mb-4">
            What our readers say
          </h2>
          <p className="text-lg text-[#64748b]">
            Real transformations from people who did the work.
          </p>
        </motion.div>

        {/* Testimonials List */}
        <div className="space-y-6">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-xl p-8"
              style={{
                backgroundColor: '#1a1a24',
                border: '1px solid #1e293b',
                borderRadius: '0.75rem',
              }}
            >
              {/* Quote Mark */}
              <div className="text-6xl text-[#f59e0b]/20 font-serif leading-none mb-4">
                &ldquo;
              </div>

              {/* Story */}
              <p className="text-base text-[#cbd5e1] leading-relaxed mb-6 line-clamp-6">
                {testimonial.story}
              </p>

              {/* Transformation Highlight */}
              <div className="mb-6 p-4 rounded-r-lg border-l-4 border-[#f59e0b] bg-[#f59e0b]/10">
                <p className="text-sm text-[#f59e0b]/80 uppercase tracking-widest font-semibold mb-1">
                  Transformation
                </p>
                <p className="text-[#f8fafc] font-medium">{testimonial.transformation}</p>
              </div>

              {/* Author Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#22222e]">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#f8fafc]">{testimonial.name}</p>
                      {testimonial.verified && (
                        <BadgeCheck className="w-4 h-4 text-[#f59e0b]" />
                      )}
                    </div>
                    <p className="text-sm text-[#64748b]">{testimonial.role}</p>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 grid grid-cols-3 gap-6"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-[#f59e0b] mb-2">
                {stat.number}
              </p>
              <p className="text-sm text-[#64748b]">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
