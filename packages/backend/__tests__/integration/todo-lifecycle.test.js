const request = require('supertest');
const { app } = require('../../src/app');

describe('Todo lifecycle integration', () => {
  it('creates, updates, reads, and deletes an item through API endpoints', async () => {
    const createResponse = await request(app)
      .post('/api/items')
      .send({ name: 'Integration Task Alpha' })
      .set('Accept', 'application/json');

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({ name: 'Integration Task Alpha' });
    expect(createResponse.body).toHaveProperty('id');
    expect(createResponse.body).toHaveProperty('created_at');

    const createdItemId = createResponse.body.id;

    const updateResponse = await request(app)
      .put(`/api/items/${createdItemId}`)
      .send({ name: 'Integration Task Alpha Updated' })
      .set('Accept', 'application/json');

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: createdItemId,
      name: 'Integration Task Alpha Updated',
    });

    const listResponse = await request(app).get('/api/items');
    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);

    const updatedItem = listResponse.body.find((item) => item.id === createdItemId);
    expect(updatedItem).toBeTruthy();
    expect(updatedItem.name).toBe('Integration Task Alpha Updated');

    const deleteResponse = await request(app).delete(`/api/items/${createdItemId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({
      message: 'Item deleted successfully',
      id: createdItemId,
    });

    const deleteAgainResponse = await request(app).delete(`/api/items/${createdItemId}`);
    expect(deleteAgainResponse.status).toBe(404);
    expect(deleteAgainResponse.body).toHaveProperty('error', 'Item not found');
  });
});
