import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Sincere Emotion/i)
  })

  test('hero section is visible', async ({ page }) => {
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()

    const headline = page.getByRole('heading', { level: 1, name: /understanding your attachment style/i })
    await expect(headline).toBeVisible()
  })

  test('products section is visible', async ({ page }) => {
    const productsSection = page.locator('#product')
    await expect(productsSection).toBeVisible()

    const sectionTitle = page.getByRole('heading', { name: /healing starts with understanding/i })
    await expect(sectionTitle).toBeVisible()
  })

  test('products are displayed', async ({ page }) => {
    const productsSection = page.locator('#product')
    await expect(productsSection).toBeVisible()

    const productCards = page.locator('#product >> text=Add to Cart')
    await expect(productCards.first()).toBeVisible()
  })

  test('testimonials section is visible', async ({ page }) => {
    const testimonials = page.locator('#testimonials')
    await expect(testimonials).toBeVisible()
  })

  test('FAQ section is visible', async ({ page }) => {
    const faq = page.locator('#faq')
    await expect(faq).toBeVisible()

    const faqTitle = page.getByRole('heading', { name: /questions & answers/i })
    await expect(faqTitle).toBeVisible()

    const faqItems = page.locator('#faq button[aria-expanded]')
    await expect(faqItems.first()).toBeVisible()
  })

  test('footer is visible', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    await expect(page.getByText(/Sincere\.emotion/i)).toBeVisible()
    await expect(page.getByText(/All rights reserved/i)).toBeVisible()
  })

  test('navigation links work', async ({ page }) => {
    const navLinks = page.locator('nav a[href^="#"]')
    await expect(navLinks.first()).toBeVisible()

    const productLink = page.getByRole('link', { name: /product/i })
    await expect(productLink).toBeVisible()

    const testimonialsLink = page.getByRole('link', { name: /testimonials/i })
    await expect(testimonialsLink).toBeVisible()

    const faqLink = page.getByRole('link', { name: /faq/i })
    await expect(faqLink).toBeVisible()
  })

  test('cart button is visible', async ({ page }) => {
    const cartButton = page.getByRole('button', { name: /shopping cart/i })
    await expect(cartButton).toBeVisible()
  })

  test('clicking product Add to Cart shows toast', async ({ page }) => {
    const addToCartButton = page.locator('#product button:has-text("Add to Cart")').first()
    await expect(addToCartButton).toBeVisible()

    await addToCartButton.click()

    await expect(page.getByRole('status', { name: /added to cart/i })).toBeVisible({ timeout: 3000 })
  })
})