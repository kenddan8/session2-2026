import React, { useState, useEffect } from 'react';
import './App.css';

const formatTimestamp = (timestampValue) => {
  const dateValue = new Date(timestampValue);
  if (Number.isNaN(dateValue.getTime())) {
    return '';
  }

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return timeFormatter.format(dateValue).toLowerCase();
};

const sortItemsAscending = (items) => {
  return [...items].sort((leftItem, rightItem) => {
    const leftTime = new Date(leftItem.created_at).getTime();
    const rightTime = new Date(rightItem.created_at).getTime();

    if (leftTime === rightTime) {
      return leftItem.id - rightItem.id;
    }

    return leftTime - rightTime;
  });
};

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemName, setEditingItemName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setItems(sortItemsAscending(result));
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newItem }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const result = await response.json();
      setItems((currentItems) => sortItemsAscending([...currentItems, result]));
      setNewItem('');
      setError(null);
    } catch (err) {
      setError('Error adding item: ' + err.message);
      console.error('Error adding item:', err);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
      setError(null);
    } catch (err) {
      setError('Error deleting item: ' + err.message);
      console.error('Error deleting item:', err);
    }
  };

  const beginEditingItem = (item) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
  };

  const cancelEditingItem = () => {
    setEditingItemId(null);
    setEditingItemName('');
  };

  const handleSaveItemTitle = async (itemId) => {
    if (!editingItemName.trim()) {
      setError('Item title cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editingItemName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const updatedItem = await response.json();
      setItems((currentItems) =>
        sortItemsAscending(
          currentItems.map((item) => (item.id === itemId ? updatedItem : item))
        )
      );
      cancelEditingItem();
      setError(null);
    } catch (err) {
      setError('Error updating item: ' + err.message);
      console.error('Error updating item:', err);
    }
  };

  const handleClearAllItems = async () => {
    try {
      const response = await fetch('/api/items', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear items');
      }

      setItems([]);
      cancelEditingItem();
      setError(null);
    } catch (err) {
      setError('Error clearing items: ' + err.message);
      console.error('Error clearing items:', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>To Do App</h1>
        <p>Keep track of your tasks</p>
      </header>

      <main>
        <section className="add-item-section">
          <h2>Add New Item</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter item name"
            />
            <button type="submit">Add Item</button>
            <button type="button" className="clear-btn" onClick={handleClearAllItems}>
              Clear
            </button>
          </form>
        </section>

        <section className="items-section">
          <h2>Items from Database</h2>
          {loading && <p>Loading data...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && (
            <ul>
              {items.length > 0 ? (
                items.map((item) => (
                  <li key={item.id}>
                    <div className="item-content">
                      {editingItemId === item.id ? (
                        <input
                          type="text"
                          value={editingItemName}
                          onChange={(event) => setEditingItemName(event.target.value)}
                          aria-label="Edit item title"
                          className="edit-input"
                        />
                      ) : (
                        <>
                          <span className="item-title">{item.name}</span>
                          <span className="item-timestamp">{formatTimestamp(item.created_at)}</span>
                        </>
                      )}
                    </div>
                    <div className="item-actions">
                      {editingItemId === item.id ? (
                        <>
                          <button
                            onClick={() => handleSaveItemTitle(item.id)}
                            className="save-btn"
                            type="button"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditingItem}
                            className="cancel-btn"
                            type="button"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => beginEditingItem(item)}
                          className="edit-btn"
                          type="button"
                          aria-label={`Edit item ${item.name}`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path
                              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-2.79z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="delete-btn"
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <p>No items found. Add some!</p>
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;