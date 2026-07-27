import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Star, Shield, Award, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Sophie - Sincere Emotion',
  description: 'Meet Sophie - Relationship Coach & Attachment Specialist. After 7 years in an anxious-avoidant relationship, she dedicated her career to helping others heal their attachment wounds and build secure, fulfilling relationships.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-4 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/10 via-transparent to-[#8b5cf6]/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-purple-500/5" />
        
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-[#f59e0b] mb-6">Our Story</p>
          <h1 className="text-5xl sm:text-7xl font-bold text-[#f8fafc] mb-8 leading-tight">
            Healing starts when you{' '}
            <span className="relative">
              <span className="relative z-10">stop chasing</span>
              <span className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#f59e0b] to-[#8b5cf6] opacity-30 -z-10" />
            </span>
            {' '}and start choosing yourself
          </h1>
          <p className="text-xl sm:text-2xl text-[#64748b] max-w-3xl mx-auto mb-12 leading-relaxed">
            After 7 years in an anxious-avoidant relationship, Sophie dedicated her life to helping others 
            break free from painful patterns and build secure, lasting love.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/products/stop-chasing-start-choosing"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a0a0f] font-semibold rounded-lg transition-all duration-300"
            >
              Start Your Healing Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/products/the-complete-healing-collection"
              className="inline-flex items-center gap-2 px-8 py-4 border border-[#64748b] text-[#f8fafc] font-semibold rounded-lg hover:border-[#f59e0b] hover:text-[#f59e0b] transition-all duration-300"
            >
              View Complete Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Sophie's Story Section */}
      <section className="py-24 px-4 bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#1a1a24] border border-[#1e293b]">
                <div className="w-full h-full bg-gradient-to-br from-[#f59e0b]/20 via-[#8b5cf6]/10 to-transparent flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#8b5cf6] flex items-center justify-center">
                      <span className="text-4xl font-bold text-[#0a0a0f]">S</span>
                    </div>
                    <h3 className="text-3xl font-bold text-[#f8fafc] mb-2">Sophie</h3>
                    <p className="text-[#f59e0b] font-medium mb-2">Relationship Coach & Attachment Specialist</p>
                    <p className="text-[#64748b] mt-4">M.Sc. Clinical Psychology • 500+ clients coached</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-[#f59e0b] to-[#8b5cf6] rounded-full opacity-20 blur-2xl" />
            </div>
            
            <div className="space-y-8">
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-[#f59e0b] mb-4">Meet Sophie</p>
                <h2 className="text-4xl sm:text-5xl font-bold text-[#f8fafc] mb-6 leading-tight">
                  I Spent 7 Years Waiting for Someone to Choose Me
                </h2>
              </div>
              
              <div className="prose prose-lg prose-invert max-w-none space-y-6">
                <p className="text-lg text-[#cbd5e1] leading-relaxed">
                  I loved an avoidant partner for almost a decade — waiting for affection that rarely came, 
                  walking on eggshells, wondering what I did wrong. I thought if I just loved them harder, 
                  softer, better… they'd finally choose me.
                </p>
                
                <p className="leading-relaxed">
                  Instead, I lost myself. I silenced my needs, softened my voice, and convinced myself 
                  that if I just gave a little more, things would get better. There were moments of 
                  connection — just enough to hold onto hope. But most of the time, I felt invisible. 
                  Unmet. Like love was always just out of reach.
                </p>
                
                <p className="leading-relaxed">
                  The turning point came when I stopped trying to earn love… and started learning how to 
                  honor my own heart. I discovered attachment theory, and for the first time, my chaos 
                  had a name: <strong>anxious attachment</strong>.
                </p>
                
                <p className="leading-relaxed">
                  I wasn't "too much." I wasn't broken. I was just trying to get love from a pattern 
                  that couldn't give it. Once I understood that, everything changed.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/products/stop-chasing-start-choosing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a0a0f] font-semibold rounded-lg transition-all duration-300"
                >
                  Start the 7-Day Guide ($9)
                </Link>
                <Link 
                  href="/products/the-anxious-heart"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-[#64748b] text-[#f8fafc] font-semibold rounded-lg hover:border-[#f59e0b] hover:text-[#f59e0b] transition-all duration-300"
                >
                  Read The Anxious Heart ($29)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials & Expertise */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0f] to-[#0f0f18]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-[#f59e0b] mb-4">Expertise</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#f8fafc] mb-4">Evidence-Based, Experience-Tested</h2>
            <p className="text-xl text-[#64748b] max-w-2xl mx-auto">
              Combining clinical psychology with real-world healing experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#1a1a24] border border-[#1e293b] rounded-2xl p-8 hover:border-[#f59e0b]/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#f59e0b] to-[#8b5cf6] rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Award className="w-7 h-7 text-[#0a0a0f]" />
              </div>
              <h3 className="text-xl font-bold text-[#f8fafc] mb-3">Clinical Psychology</h3>
              <p className="text-[#64748b] leading-relaxed">
                Master's degree in Clinical Psychology with specialized training in attachment theory, 
                trauma-informed care, and cognitive behavioral therapy.
              </p>
            </div>
            
            <div className="bg-[#1a1a24] border border-[#1e293b] rounded-2xl p-8 hover:border-[#f59e0b]/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#8b5cf6] to-[#f59e0b] rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7 text-[#0a0a0f]" />
              </div>
              <h3 className="text-xl font-bold text-[#f8fafc] mb-3">500+ Clients Coached</h3>
              <p className="text-[#64748b] leading-relaxed">
                Over a decade of one-on-one coaching helping individuals and couples heal attachment 
                wounds and build secure relationships.
              </p>
            </div>
            
            <div className="bg-[#1a1a24] border border-[#1e293b] rounded-2xl p-8 hover:border-[#f59e0b]/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#10b981] to-[#f59e0b] rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Shield className="w-7 h-7 text-[#0a0a0f]" />
              </div>
              <h3 className="text-xl font-bold text-[#f8fafc] mb-3">Evidence-Based Approach</h3>
              <p className="text-[#64748b] leading-relaxed">
                Every guide combines attachment theory research, neuroscience, and clinical practice 
                — no fluff, just what actually works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-24 px-4 bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-[#f59e0b] mb-4">Our Mission</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#f8fafc] mb-4">
              Everyone Deserves Secure Love
            </h2>
            <p className="text-xl text-[#64748b] max-w-2xl mx-auto">
              Not the kind that makes you question your worth. The kind that feels like home.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Star, title: "Clarity Over Confusion", desc: "Replace anxiety with understanding. Know exactly what's happening in your relationships and why." },
              { icon: Shield, title: "Safety Over Survival", desc: "Stop managing others' emotions. Build relationships where you feel safe being yourself." },
              { icon: Award, title: "Growth Over Perfection", desc: "Healing isn't about being fixed. It's about becoming more fully yourself, every day." },
            ].map((item, i) => (
              <div key={i} className="bg-[#1a1a24] border border-[#1e293b] rounded-2xl p-8 text-center hover:border-[#f59e0b]/50 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#f59e0b]/20 to-[#8b5cf6]/20 rounded-2xl flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-[#f59e0b]" />
                </div>
                <h3 className="text-xl font-bold text-[#f8fafc] mb-3">{item.title}</h3>
                <p className="text-[#64748b] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-[#1a1a24] via-[#0a0a0f] to-[#0a0a0f]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/10 to-[#8b5cf6]/10 rounded-3xl" />
            <div className="relative p-12 rounded-3xl border border-[#1e293b]">
              <h2 className="text-4xl sm:text-5xl font-bold text-[#f8fafc] mb-6">
                Ready to Start Your Healing Journey?
              </h2>
              <p className="text-xl text-[#64748b] mb-10 max-w-xl mx-auto leading-relaxed">
                You don't have to figure this out alone. Join thousands who've already started healing 
                with our evidence-based guides.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/products/stop-chasing-start-choosing"
                  className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#f59e0b] to-[#f97316] hover:from-[#d97706] hover:to-[#f59e0b] text-[#0a0a0f] font-bold rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/25"
                >
                  Get the 7-Day Guide — $9
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/products/the-complete-healing-collection"
                  className="inline-flex items-center gap-2 px-10 py-4 border-2 border-[#f59e0b] text-[#f59e0b] font-bold rounded-lg hover:bg-[#f59e0b]/10 transition-all duration-300"
                >
                  Get the Complete Collection — $59
                </Link>
              </div>
              <p className="text-sm text-[#64748b] mt-6">
                Instant access · 30-day guarantee · Lifetime updates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Trust Badges */}
      <section className="py-16 px-4 border-t border-[#1e293b] bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 text-[#64748b] text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>30-Day Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Lifetime Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>500+ Clients Helped</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}