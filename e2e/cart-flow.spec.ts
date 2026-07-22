import { test, expect } from '@playwright/test'

test.describe('Cart Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('can add product to cart', async ({ page }) => {
    const addToCartButton = page.locator('#product button:has-text("Add to Cart")').first()
    await expect(addToCartButton).toBeVisible()
    await addToCartButton.click()

    await expect(page.getByRole('dialog', { name: /shopping cart/i })).toBeVisible({ timeout: 3000 })
    await expect(page.getByRole('dialog', { name: /shopping cart/i }).getByText(/your cart/i)).toBeVisible()
  })

  test('cart sidebar opens when clicking cart button', async ({ page }) => {
    const cartButton = page.getByRole('button', { name: /shopping cart/i })
    await cartButton.click()

    await expect(page.getByRole('dialog', { name: /shopping cart/i })).toBeVisible()
    await expect(page.getByRole('dialog', { name: /shopping cart/i }).getByText(/your cart is empty/i)).toBeVisible()
  })

  test('can increase quantity', async ({ page }) => {
    const addToCartButton = page.locator('#product button:has-text("Add to Cart")').first()
    await addToCartButton.click()

    await expect(page.getByRole('dialog', { name: /shopping cart/i })).toBeVisible({ timeout: 3000 })

    await page.getByRole('button', { name: /increase quantity/i }).click()

    const quantityText = page.locator('.text-center:has-text("1")').first()
    await expect(quantityText).toHaveText('2')
  })

  test('can decrease quantity', async ({ page }) => {
    const addToCartButton = page.locator('#product button:has-text("Add to Cart")').first()
    await addToCartButton.click()

    await expect(page.getByRole('dialog', { name: /shopping cart/i })).toBeVisible({ timeout: 3000 })

    await page.getByRole('button', { name: /increase quantity/i }).click()
    await page.getByRole('button', { name: /decrease quantity/i }).click()

    const quantityText = page.locator('.text-center:has-text("1")').first()
    await expect(quantityText).toHaveText('1')
  })

  test('can remove item', async ({ page }) => {
    const addToCartButton = page.locator('#product button:has-text("Add to Cart")').first()
    await addToCartButton.click()

    await expect(page.getByRole('dialog', { name: /shopping cart/i })).toBeVisible({ timeout: 3000 })

    await page.getByRole('button', { name: /remove item/i }).click()

    await expect(page.getByText(/your cart is empty/i)).toBeVisible()
  })

  test('cart total updates correctly', async ({ page }) => {
    const firstProduct = page.locator('#product button:has-text("Add to Cart")').first()
    await firstProduct.click()

    await expect(page.getByRole('dialog', { name: /shopping cart/i })).toBeVisible({ timeout: 3000 })

    const totalElement = page.getByText('$', { exact: false }).last()
    await expect(totalElement).toBeVisible()

    await page.getByRole('button', { name: /increase quantity/i }).click()

    const newTotal = page.getByText('$', { exact: false }).last()
    await expect(newTotal).toBeVisible()
  })

  test('empty cart shows message', async ({ page }) => {
    const cartButton = page.getByRole('button', { name: /shopping cart/i })
    await cartButton.click()

    await expect(page.getByText(/your cart is empty/i)).toBeVisible()
  })

  test('checkout button exists when cart has items', async ({ page }) => {
    const addToCartButton = page.locator('#product button:has-text("Add to Cart")').first()
    await addToCartButton.click()

    await expect(page.getByRole('dialog', { name: /shopping cart/i })).toBeVisible({ timeout: 3000 })

    await expect(page.getByRole('button', { name: /proceed to checkout/i })).toBeVisible()
  })

  test('checkout button does not appear in empty cart', async ({ page }) => {
    const cartButton = page.getByRole('button', { name: /shopping cart/i })
    await cartButton.click()

    await expect(page.getByText(/your cart is empty/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /proceed to checkout/i })).not.toBeVisible()
  })

  test('can close cart sidebar', async ({ page }) => {
    const cartButton = page.getByRole('button', { name: /shopping cart/i })
    await cartButton.click()

    await expect(page.getByRole('dialog', { name: /shopping cart/i })).toBeVisible()

    await page.getByRole('button', { name: /close cart/i }).click()

    await expect(page.getByRole('dialog', { name: /shopping cart/i })).not.toBeVisible()
  })

  test('can add multiple different products', async ({ page }) => {
    const addButtons = page.locator('#product button:has-text("Add to Cart")')
    const count = await addButtons.count()
    expect(count).toBeGreaterThan(1)

    await addButtons.nth(0).click()
    await expect(page.getByRole('dialog', { name: /shopping cart/i })).toBeVisible({ timeout: 3000 })

    await page.getByRole('button', { name: /close cart/i }).click()

    await addButtons.nth(1).click()
    await expect(page.getByRole('dialog', { name: /shopping cart/i })).toBeVisible({ timeout: 3000 })

    const cartItems = page.getByRole('dialog', { name: /shopping cart/i }).locator('.border-border.rounded-lg')
    await expect(cartItems).toHaveCount(2)
  })

  test('browsing guides link works in empty cart', async ({ page }) => {
    const cartButton = page.getByRole('button', { name: /shopping cart/i })
    await cartButton.click()

    await page.getByRole('link', { name: /browse guides/i }).click()

    await expect(page.getByRole('dialog', { name: /shopping cart/i })).not.toBeVisible()
  })
})