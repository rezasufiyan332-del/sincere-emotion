import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Sincere Emotion',
  description: 'Terms of Service for Sincere Emotion - Rules and guidelines for using our website and services.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-6">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: July 22, 2026</p>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Sincere Emotion, you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Products and Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We sell digital guides related to attachment styles and relationship psychology. All products are 
              delivered digitally and are for personal use only.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Products are licensed for personal, non-commercial use</li>
              <li>Sharing, redistributing, or reselling is prohibited</li>
              <li>You may not modify or create derivative works</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Pricing and Payment</h2>
            <p className="text-muted-foreground leading-relaxed">
              All prices are in USD. Payments are processed securely through Stripe. We reserve the right to 
              change prices at any time. Your purchase is subject to our Refund Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Refund Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We offer a 30-day money-back guarantee on all purchases. If you are not satisfied with your purchase, 
              contact us within 30 days for a full refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on this website, including text, graphics, logos, and digital products, is the property 
              of Sincere Emotion and is protected by copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sincere Emotion shall not be liable for any indirect, incidental, special, consequential, or 
              punitive damages resulting from your use of our products or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, contact us at{' '}
              <a href="mailto:legal@sincereemotion.com" className="text-primary hover:underline">
                legal@sincereemotion.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}