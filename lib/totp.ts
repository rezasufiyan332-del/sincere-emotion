import { TOTP, generateSecret, generateURI, verifySync } from 'otplib'
import crypto from 'crypto'

// Generate TOTP secret
export function generateTOTPSecret(): string {
  return generateSecret()
}

// Verify TOTP token
export function verifyTOTPToken(token: string, secret: string): boolean {
  try {
    return verifySync({ token, secret }).valid
  } catch {
    return false
  }
}

// Generate QR code URL for authenticator apps
export function generateTOTPQRCodeURL(
  email: string,
  secret: string,
  issuer = 'Sincere Emotion'
): string {
  return generateURI({
    secret,
    label: email,
    issuer,
  })
}

// Generate backup codes (8 codes, each 8 chars)
export function generateBackupCodes(count = 8): string[] {
  const codes = []
  for (let i = 0; i < count; i++) {
    // 4 bytes = 8 hex chars, uppercase
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase())
  }
  return codes
}