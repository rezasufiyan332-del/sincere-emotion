import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.describe('Login', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login')
      await page.waitForLoadState('networkidle')
    })

    test('login form is visible', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('form validation works for empty fields', async ({ page }) => {
      await page.getByRole('button', { name: /sign in/i }).click()

      await expect(page.getByText('Invalid email address')).toBeVisible()
      await expect(page.getByText('Password is required')).toBeVisible()
    })

    test('can navigate to register from login', async ({ page }) => {
      await page.getByRole('link', { name: /create one/i }).click()
      await expect(page).toHaveURL(/\/auth\/register/)
      await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
    })

    test('forgot password link exists', async ({ page }) => {
      await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible()
    })

    test('password visibility toggle works', async ({ page }) => {
      const passwordInput = page.getByLabel('Password')
      await expect(passwordInput).toHaveAttribute('type', 'password')

      await page.getByRole('button', { name: /show password/i }).click()
      await expect(passwordInput).toHaveAttribute('type', 'text')

      await page.getByRole('button', { name: /hide password/i }).click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  test.describe('Register', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/register')
      await page.waitForLoadState('networkidle')
    })

    test('register form is visible', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
      await expect(page.getByLabel('Full Name')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByLabel('Confirm Password')).toBeVisible()
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
    })

    test('form validation works for empty fields', async ({ page }) => {
      await page.getByRole('button', { name: /create account/i }).click()

      await expect(page.getByText('Name must be at least 2 characters')).toBeVisible()
      await expect(page.getByText('Invalid email address')).toBeVisible()
      await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
    })

    test('can navigate to login from register', async ({ page }) => {
      await page.getByRole('link', { name: /sign in/i }).click()
      await expect(page).toHaveURL(/\/auth\/login/)
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    })

    test('password validation - minimum length', async ({ page }) => {
      await page.getByLabel('Password').fill('Short1')
      await page.getByLabel('Confirm Password').fill('Short1')
      await page.getByRole('button', { name: /create account/i }).click()

      await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
    })

    test('password validation - uppercase required', async ({ page }) => {
      await page.getByLabel('Password').fill('alllowercase1')
      await page.getByLabel('Confirm Password').fill('alllowercase1')
      await page.getByRole('button', { name: /create account/i }).click()

      await expect(page.getByText('Password must contain at least one uppercase letter')).toBeVisible()
    })

    test('password validation - number required', async ({ page }) => {
      await page.getByLabel('Password').fill('NoNumbersHere')
      await page.getByLabel('Confirm Password').fill('NoNumbersHere')
      await page.getByRole('button', { name: /create account/i }).click()

      await expect(page.getByText('Password must contain at least one number')).toBeVisible()
    })

    test('password confirmation mismatch', async ({ page }) => {
      await page.getByLabel('Full Name').fill('Test User')
      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('Password').fill('StrongPass1')
      await page.getByLabel('Confirm Password').fill('DifferentPass1')
      await page.getByRole('button', { name: /create account/i }).click()

      await expect(page.getByText('Passwords do not match')).toBeVisible()
    })

    test('password visibility toggle works', async ({ page }) => {
      const passwordInput = page.getByLabel('Password')
      await expect(passwordInput).toHaveAttribute('type', 'password')

      await page.getByLabel('Password').first().locator('..').locator('button').click()
      await expect(passwordInput).toHaveAttribute('type', 'text')
    })
  })

  test.describe('Navigation between forms', () => {
    test('can toggle between login and register', async ({ page }) => {
      await page.goto('/auth/login')
      await page.getByRole('link', { name: /create one/i }).click()
      await expect(page).toHaveURL(/\/auth\/register/)

      await page.getByRole('link', { name: /sign in/i }).click()
      await expect(page).toHaveURL(/\/auth\/login/)
    })
  })
})