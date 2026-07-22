import { Resend } from 'resend'

const FROM_EMAIL = process.env.EMAIL_FROM || 'Sincere Emotion <onboarding@resend.dev>'

// SECURITY: HTML escaping to prevent XSS in email templates
function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return str.replace(/[&<>"']/g, (char) => map[char])
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set - emails will not be sent')
    return null
  }
  return new Resend(apiKey)
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const resend = getResend()
    if (!resend) {
      console.log('Skipping welcome email - RESEND_API_KEY not configured')
      return { success: false, error: 'RESEND_API_KEY not configured' }
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Sincere Emotion!',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome, ${escapeHtml(name || 'there')}!</h1>
          <p style="line-height: 1.6; margin-bottom: 16px;">
            Thank you for joining Sincere Emotion. We're here to help you understand your attachment style and build healthier relationships.
          </p>
          <p style="line-height: 1.6; margin-bottom: 24px;">
            Explore our evidence-based guides designed to help you break anxious patterns, build emotional safety, and create the secure relationships you deserve.
          </p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" 
             style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Browse Guides
          </a>
          <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
            If you have any questions, reply to this email. We're here to help.
          </p>
          <p style="color: #64748b; font-size: 14px;">
            &mdash; The Sincere Emotion Team
          </p>
        </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error }
  }
}

export async function sendOrderConfirmation(
  email: string,
  name: string,
  items: Array<{ name: string; price: number; quantity: number }>,
  total: number
) {
  try {
    const resend = getResend()
    if (!resend) {
      console.log('Skipping order confirmation - RESEND_API_KEY not configured')
      return { success: false, error: 'RESEND_API_KEY not configured' }
    }

    const itemRows = items
      .map(item => `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.name)}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">$${((item.price * item.quantity) / 100).toFixed(2)}</td></tr>`)
      .join('')

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Order Confirmed \u2014 Sincere Emotion',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e;">
          <h1 style="font-size: 24px; margin-bottom: 8px;">Order Confirmed!</h1>
          <p style="color: #64748b; margin-bottom: 24px;">Thank you for your purchase, ${escapeHtml(name || 'there')}.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb;">
                <th style="padding:8px;text-align:left;">Item</th>
                <th style="padding:8px;text-align:center;">Qty</th>
                <th style="padding:8px;text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td colspan="2" style="padding:8px;font-weight:bold;">Total</td>
                <td style="padding:8px;text-align:right;font-weight:bold;">$${(total / 100).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <p style="line-height: 1.6; margin-bottom: 16px;">
            Your guides are ready. You can access them from your dashboard.
          </p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600;">
            View Your Orders
          </a>
          <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
            &mdash; The Sincere Emotion Team
          </p>
        </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send order confirmation:', error)
    return { success: false, error }
  }
}

export async function sendNewsletterWelcome(email: string, unsubscribeUrl?: string) {
  try {
    const resend = getResend()
    if (!resend) {
      console.log('Skipping newsletter welcome - RESEND_API_KEY not configured')
      return { success: false, error: 'RESEND_API_KEY not configured' }
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to the Sincere Emotion Newsletter!',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">You're Subscribed!</h1>
          <p style="line-height: 1.6; margin-bottom: 16px;">
            Thank you for subscribing to the Sincere Emotion newsletter. You'll receive insights on attachment theory, relationship psychology, and healing strategies.
          </p>
          ${unsubscribeUrl ? `
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">You're all set! Manage your preferences or unsubscribe anytime.</p>
            <a href="${unsubscribeUrl}" style="color: #f59e0b; text-decoration: none;">Unsubscribe</a>
          </div>
          ` : ''}
          <p style="color: #64748b; font-size: 14px;">
            &mdash; The Sincere Emotion Team
          </p>
        </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send newsletter welcome:', error)
    return { success: false, error }
  }
}

export async function sendResetPasswordEmail(email: string, name: string, resetUrl: string) {
  try {
    const resend = getResend()
    if (!resend) {
      console.log('Skipping reset password email - RESEND_API_KEY not configured')
      return { success: false, error: 'RESEND_API_KEY not configured' }
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password \u2014 Sincere Emotion',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Reset Your Password</h1>
          <p style="line-height: 1.6; margin-bottom: 16px;">Hi ${escapeHtml(name || 'there')},</p>
          <p style="line-height: 1.6; margin-bottom: 24px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 14px 28px; background-color: #f59e0b; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600; margin-bottom: 24px;">
            Reset Password
          </a>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
          <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
            &mdash; The Sincere Emotion Team
          </p>
        </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send reset password email:', error)
    return { success: false, error }
  }
}

export async function sendVerificationEmail(email: string, name: string, verificationUrl: string) {
  try {
    const resend = getResend()
    if (!resend) {
      console.log('Skipping verification email - RESEND_API_KEY not configured')
      return { success: false, error: 'RESEND_API_KEY not configured' }
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify Your Email \u2014 Sincere Emotion',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Verify Your Email Address</h1>
          <p style="line-height: 1.6; margin-bottom: 16px;">Hi ${escapeHtml(name || 'there')},</p>
          <p style="line-height: 1.6; margin-bottom: 24px;">
            Thanks for signing up for Sincere Emotion! Please verify your email address to unlock all features.
          </p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 14px 28px; background-color: #f59e0b; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600; margin-bottom: 24px;">
            Verify Your Email
          </a>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
            &mdash; The Sincere Emotion Team
          </p>
        </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { success: false, error }
  }
}

export async function sendRefundEmail(email: string, name: string, amount: number) {
  try {
    const resend = getResend()
    if (!resend) {
      console.log('Skipping refund email - RESEND_API_KEY not configured')
      return { success: false, error: 'RESEND_API_KEY not configured' }
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Refund Processed \u2014 Sincere Emotion',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Refund Processed</h1>
          <p style="line-height: 1.6; margin-bottom: 16px;">Hi ${escapeHtml(name || 'there')},</p>
          <p style="line-height: 1.6; margin-bottom: 24px;">
            Your refund of <strong>$${(amount / 100).toFixed(2)}</strong> has been processed and will appear in your account within 5-10 business days.
          </p>
          <p style="line-height: 1.6; margin-bottom: 24px;">
            If you have any questions about this refund, please don't hesitate to contact our support team.
          </p>
          <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
            &mdash; The Sincere Emotion Team
          </p>
        </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send refund email:', error)
    return { success: false, error }
  }
}