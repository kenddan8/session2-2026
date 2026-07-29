import React, { act } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const server = setupServer(
  rest.get('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'Older Item', created_at: '2023-01-01T17:35:00.000Z' },
        { id: 2, name: 'Newer Item', created_at: '2023-01-01T18:35:00.000Z' },
      ])
    );
  }),
  rest.post('/api/items', async (req, res, ctx) => {
    const { name } = await req.json();

    if (!name || name.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Item name is required' }));
    }

    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        name,
        created_at: '2023-01-01T19:35:00.000Z',
      })
    );
  }),
  rest.put('/api/items/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const { name } = await req.json();

    if (!name || name.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Item name is required' }));
    }

    return res(
      ctx.status(200),
      ctx.json({
        id: Number(id),
        name,
        created_at: '2023-01-01T17:35:00.000Z',
      })
    );
  }),
  rest.delete('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: 'All items cleared successfully', deletedCount: 2 })
    );
  }),
  rest.delete('/api/items/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: 'Item deleted successfully', id: Number(req.params.id) })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the app header and subtitle', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('To Do App')).toBeInTheDocument();
    expect(screen.getByText('Keep track of your tasks')).toBeInTheDocument();
  });

  test('loads and displays items with timestamp subtext', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Older Item')).toBeInTheDocument();
      expect(screen.getByText('Newer Item')).toBeInTheDocument();
    });

    expect(screen.getByText('05:35 pm')).toBeInTheDocument();
    expect(screen.getByText('06:35 pm')).toBeInTheDocument();
  });

  test('adds a new item and keeps ascending time order', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });

    await act(async () => {
      await user.type(screen.getByPlaceholderText('Enter item name'), 'Newest Item');
      await user.click(screen.getByRole('button', { name: 'Add Item' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Newest Item')).toBeInTheDocument();
      expect(screen.getByText('07:35 pm')).toBeInTheDocument();
    });

    const itemTitles = screen
      .getAllByRole('listitem')
      .map((itemElement) => within(itemElement).getByText(/Item/).textContent);

    expect(itemTitles).toEqual(['Older Item', 'Newer Item', 'Newest Item']);
  });

  test('supports editing an item title with the pencil action', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Older Item')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit item Older Item' }));
    });

    const editInput = screen.getByLabelText('Edit item title');
    await act(async () => {
      await user.clear(editInput);
      await user.type(editInput, 'Edited Item');
      await user.click(screen.getByRole('button', { name: 'Save' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Edited Item')).toBeInTheDocument();
    });
  });

  test('clears all items from the list', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Older Item')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Clear' }));
    });

    await waitFor(() => {
      expect(screen.getByText('No items found. Add some!')).toBeInTheDocument();
    });
  });

  test('shows validation when saving an empty edited title', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Older Item')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit item Older Item' }));
    });

    const editInput = screen.getByLabelText('Edit item title');
    await act(async () => {
      await user.clear(editInput);
      await user.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(screen.getByText('Item title cannot be empty')).toBeInTheDocument();
  });
});
