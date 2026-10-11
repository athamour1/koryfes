import { expect } from '@playwright/test';

/**
 * Click a side-drawer entry. Below the drawer breakpoint (1023px) it is
 * parked off-screen rather than hidden, so open it first.
 */
export async function navTo(page, testId) {
  const item = page.getByTestId(testId);
  if (page.viewportSize().width <= 1023) {
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(item).toBeInViewport();
  }
  await item.click();
}

/** Quasar toast by colour: 'positive' | 'negative' */
export const toast = (page, color) => page.locator(`.q-notification.bg-${color}`);
