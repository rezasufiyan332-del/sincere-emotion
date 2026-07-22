import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Sincere Emotion',
  description: 'Privacy Policy for Sincere Emotion - How we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: July 22, 2026</p>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Sincere Emotion. We are committed to protecting your privacy. This Privacy Policy explains 
              how we collect, use, disclose, and safeguard your information when you visit our website and purchase 
              our digital guides.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may collect information about you in various ways, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Personal Data:</strong> Name, email address, and payment information when you make a purchase.</li>
              <li><strong>Derivative Data:</strong> Information automatically collected when you access our website, such as IP address, browser type, and usage data.</li>
              <li><strong>Transaction Data:</strong> Details of purchases and payment methods used.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Use of Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Process transactions and deliver purchased products</li>
              <li>Send administrative information (order confirmations, updates)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve our website and products</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use administrative, technical, and physical security measures to protect your personal information. 
              However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@sincereemotion.com" className="text-primary hover:underline">
                privacy@sincereemotion.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}