const { expect } = require('@playwright/test');

class TodoPage {
  constructor(page) {
    this.page = page;
    this.title = page.getByRole('heading', { name: 'To Do App' });
    this.itemInput = page.getByPlaceholder('Enter item name');
    this.addButton = page.getByRole('button', { name: 'Add Item' });
    this.clearButton = page.getByRole('button', { name: 'Clear' });
    this.emptyStateMessage = page.getByText('No items found. Add some!');
  }

  async goto() {
    await this.page.goto('/');
  }

  async clearAllItems() {
    await this.clearButton.click();
  }

  async addItem(itemName) {
    await this.itemInput.fill(itemName);
    await this.addButton.click();
    await expect(this.itemTitle(itemName)).toBeVisible();
  }

  editButtonFor(itemName) {
    return this.page.getByRole('button', { name: `Edit item ${itemName}` });
  }

  deleteButtonForRow(itemName) {
    return this.page
      .locator('li')
      .filter({ has: this.page.getByText(itemName) })
      .getByRole('button', { name: 'Delete' });
  }

  itemTitle(itemName) {
    return this.page.locator('.item-title', { hasText: itemName });
  }

  timestampFor(itemName) {
    return this.page
      .locator('li')
      .filter({ has: this.page.getByText(itemName) })
      .locator('.item-timestamp');
  }

  async editItemTitle(currentName, updatedName) {
    await this.editButtonFor(currentName).click();
    const editInput = this.page.getByLabel('Edit item title');
    await editInput.fill(updatedName);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async expectItemsInOrder(expectedNames) {
    const actualNames = await this.page.locator('.item-title').allTextContents();
    expect(actualNames).toEqual(expectedNames);
  }
}

module.exports = { TodoPage };
