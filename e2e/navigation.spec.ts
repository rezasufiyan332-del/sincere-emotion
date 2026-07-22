import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('header is sticky', async ({ page }) => {
    const header = page.locator('header').first()
    await expect(header).toBeVisible()

    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(100)

    await expect(header).toBeVisible()
  })

  test('scroll progress bar exists', async ({ page }) => {
    const progressBar = page.locator('[role="progressbar"], .scroll-progress, [data-testid="scroll-progress"]')
    await expect(progressBar.first()).toBeVisible()

    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(100)

    const progressWidth = await progressBar.first().evaluate(el => el.getBoundingClientRect().width)
    expect(progressWidth).toBeGreaterThan(0)
  })

  test('mobile menu toggle works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const mobileMenuButton = page.getByRole('button', { name: /menu/i })
    await expect(mobileMenuButton).toBeVisible()

    await mobileMenuButton.click()

    const mobileMenu = page.getByRole('navigation', { name: /mobile menu/i }).or(page.locator('[role="dialog"]'))
    await expect(mobileMenu.first()).toBeVisible()

    await mobileMenuButton.click()

    await expect(mobileMenu.first()).not.toBeVisible()
  })

  test('logo links to home', async ({ page }) => {
    const logo = page.getByRole('link', { name: /sincere emotion/i }).or(page.getByRole('link', { name: /sincere/i }))
    await expect(logo).toBeVisible()

    await logo.click()

    await expect(page).toHaveURL(/\/^/)
  })

  test('navigation links to products section', async ({ page }) => {
    const productLink = page.getByRole('link', { name: /product/i }).first()
    await expect(productLink).toBeVisible()

    await productLink.click()

    await expect(page.locator('#product')).toBeInViewport()
  })

  test('navigation links to testimonials section', async ({ page }) => {
    const testimonialsLink = page.getByRole('link', { name: /testimonial/i }).first()
    await expect(testimonialsLink).toBeVisible()

    await testimonialsLink.click()

    await expect(page.locator('#testimonials')).toBeInViewport()
  })

  test('navigation links to faq section', async ({ page }) => {
    const faqLink = page.getByRole('link', { name: /faq/i }).first()
    await expect(faqLink).toBeVisible()

    await faqLink.click()

    await expect(page.locator('#faq')).toBeInViewport()
  })

  test('auth navigation links work', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /login/i }).first()
    await expect(loginLink).toBeVisible()

    await loginLink.click()
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('mobile viewport shows hamburger menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const hamburger = page.getByRole('button', { name: /menu/i })
    await expect(hamburger).toBeVisible()

    await hamburger.click()

    const mobileNav = page.locator('[role="navigation"]').or(page.locator('[data-testid="mobile-menu"]'))
    await expect(mobileNav.first()).toBeVisible()
  })

  test('desktop viewport shows inline navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })

    const navLinks = page.locator('nav a[href^="#"]')
    await expect(navLinks.first()).toBeVisible()

    const hamburger = page.getByRole('button', { name: /menu/i })
    await expect(hamburger).not.toBeVisible()
  })

  test('CTA button scrolls to products', async ({ page }) => {
    const ctaButton = page.getByRole('link', { name: /browse guides/i }).first()
    await expect(ctaButton).toBeVisible()

    await ctaButton.click()

    await expect(page.locator('#product')).toBeInViewport()
  })

  test('CTA section is visible', async ({ page }) => {
    const ctaSection = page.locator('#cta, section:has-text("Ready to transform")').first()
    await expect(ctaSection).toBeVisible()
  })
})