const request = require('supertest');
const { app } = require('../src/app');

// Test helpers
const createItem = async (name = 'Temp Item to Delete') => {
  const response = await request(app)
    .post('/api/items')
    .send({ name })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if items have the expected structure
      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('created_at');
    });

    it('should return items in ascending order by timestamp and id', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);

      const sortedItems = [...response.body].sort((leftItem, rightItem) => {
        const leftTime = new Date(leftItem.created_at).getTime();
        const rightTime = new Date(rightItem.created_at).getTime();

        if (leftTime === rightTime) {
          return leftItem.id - rightItem.id;
        }

        return leftTime - rightTime;
      });

      expect(response.body).toEqual(sortedItems);
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = { name: 'Test Item' };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await createItem('Item To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Item deleted successfully', id: item.id });

      const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an existing item name', async () => {
      const item = await createItem('Initial Name');

      const updateResponse = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: 'Updated Name' })
        .set('Accept', 'application/json');

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toHaveProperty('id', item.id);
      expect(updateResponse.body).toHaveProperty('name', 'Updated Name');
      expect(updateResponse.body).toHaveProperty('created_at', item.created_at);
    });

    it('should return 400 when updated name is empty', async () => {
      const item = await createItem('Name To Update');

      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: '   ' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Item name is required');
    });

    it('should return 404 when updating an unknown item', async () => {
      const response = await request(app)
        .put('/api/items/999999')
        .send({ name: 'Updated Name' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });
  });

  describe('DELETE /api/items', () => {
    it('should clear all items', async () => {
      await createItem('Item 1');
      await createItem('Item 2');

      const clearResponse = await request(app).delete('/api/items');
      expect(clearResponse.status).toBe(200);
      expect(clearResponse.body).toHaveProperty('message', 'All items cleared successfully');
      expect(clearResponse.body).toHaveProperty('deletedCount');

      const listResponse = await request(app).get('/api/items');
      expect(listResponse.status).toBe(200);
      expect(listResponse.body).toEqual([]);
    });
  });
});