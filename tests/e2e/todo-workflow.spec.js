const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/todo-page');

test.describe('todo workflow e2e', () => {
  test('adds, edits, and clears todo items with timestamp display', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.goto();
    await expect(todoPage.title).toBeVisible();

    await todoPage.clearAllItems();
    await expect(todoPage.emptyStateMessage).toBeVisible();

    await todoPage.addItem('E2E First Task');
    await todoPage.addItem('E2E Second Task');

    await expect(todoPage.itemTitle('E2E First Task')).toBeVisible();
    await expect(todoPage.itemTitle('E2E Second Task')).toBeVisible();
    await expect(todoPage.timestampFor('E2E First Task')).toHaveText(/\d{2}:\d{2} [ap]m/);

    await todoPage.expectItemsInOrder(['E2E First Task', 'E2E Second Task']);

    await todoPage.editItemTitle('E2E First Task', 'E2E First Task Updated');
    await expect(todoPage.itemTitle('E2E First Task Updated')).toBeVisible();

    await todoPage.clearAllItems();
    await expect(todoPage.emptyStateMessage).toBeVisible();
  });
});
