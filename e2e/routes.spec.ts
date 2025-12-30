import { expect, test } from '@playwright/test'

test('routes: Home → Word List → Practice → Exercise → Help', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible()

  await page.getByRole('link', { name: 'Word List' }).click()
  await expect(page).toHaveURL(/\/word-list$/)
  await expect(page.getByRole('heading', { name: 'Word List' })).toBeVisible()

  await page.getByRole('link', { name: 'Practice' }).click()
  await expect(page).toHaveURL(/\/practice$/)
  await expect(page.getByRole('heading', { name: 'Practice' })).toBeVisible()

  await page.getByRole('link', { name: 'Exercise' }).click()
  await expect(page).toHaveURL(/\/exercise$/)
  await expect(page.getByRole('heading', { name: 'Exercise' })).toBeVisible()

  await page.getByRole('link', { name: 'Help' }).click()
  await expect(page).toHaveURL(/\/help$/)
  await expect(page.getByRole('heading', { name: 'Help' })).toBeVisible()
})
