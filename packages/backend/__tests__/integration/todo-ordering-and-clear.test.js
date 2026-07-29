const request = require('supertest');
const { app } = require('../../src/app');

describe('Todo ordering and clear-all integration', () => {
  it('returns items in ascending order and clears all items in one request', async () => {
    await request(app).delete('/api/items');

    const firstCreateResponse = await request(app)
      .post('/api/items')
      .send({ name: 'Older Integration Task' })
      .set('Accept', 'application/json');

    expect(firstCreateResponse.status).toBe(201);

    const secondCreateResponse = await request(app)
      .post('/api/items')
      .send({ name: 'Newer Integration Task' })
      .set('Accept', 'application/json');

    expect(secondCreateResponse.status).toBe(201);

    const listResponse = await request(app).get('/api/items');
    expect(listResponse.status).toBe(200);

    const itemNames = listResponse.body.map((item) => item.name);
    expect(itemNames).toEqual(['Older Integration Task', 'Newer Integration Task']);

    const clearResponse = await request(app).delete('/api/items');
    expect(clearResponse.status).toBe(200);
    expect(clearResponse.body).toHaveProperty('message', 'All items cleared successfully');
    expect(clearResponse.body).toHaveProperty('deletedCount', 2);

    const emptyListResponse = await request(app).get('/api/items');
    expect(emptyListResponse.status).toBe(200);
    expect(emptyListResponse.body).toEqual([]);
  });
});
