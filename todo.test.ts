import { test, expect } from '@playwright/test';

test.describe('Todo App E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    // Go to your app's page
    await page.goto('/');
  });

  test('should display correct title on the homepage', async ({ page }) => {
    // Check if the title is correct
    await expect(page).toHaveTitle('Todo App');
  });

  test('should create a new todo item', async ({ page }) => {
    // Interact with the UI to add a new Todo item
    await page.fill('#new-todo-input', 'New Playwright Todo');
    await page.click('#submit-todo-button');

    // Verify the new item is added to the list
    const todoItem = await page.locator('.todo-item').last();
    await expect(todoItem).toHaveText('New Playwright Todo');
  });

  
});
