import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - Sincere Emotion',
  description: 'Learn about our mission to help people understand attachment styles and build healthier relationships through evidence-based guides.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-6">About Sincere Emotion</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Sincere Emotion was founded with a simple mission: to help people understand their attachment styles 
            and build the secure, healthy relationships they deserve.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We believe that understanding your attachment style is the first step toward healing and growth. 
            Our evidence-based guides are designed to help you break anxious patterns, build emotional safety, 
            and create authentic connections.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Our Approach</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Every guide we create is rooted in attachment theory research and clinical psychology. We combine 
            scientific understanding with practical, actionable strategies that you can apply in your daily life.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">What We Offer</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            <li>Comprehensive guides on anxious, avoidant, and secure attachment</li>
            <li>Practical exercises and worksheets</li>
            <li>Real-world examples and case studies</li>
            <li>Lifetime access to all materials</li>
            <li>30-day money-back guarantee</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Our Commitment</h2>
          <p className="text-muted-foreground leading-relaxed">
            We are committed to providing high-quality, accessible resources that make a real difference 
            in people's lives. Your healing journey matters to us, and we are here to support you every step of the way.
          </p>
        </div>
      </div>
    </div>
  )
}