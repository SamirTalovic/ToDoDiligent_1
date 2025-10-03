import agent from '../api/agent';
import TodoItemStore from './todoStore';

jest.mock('../api/agent');

describe('TodoItemStore', () => {
  let store: TodoItemStore;

  beforeEach(() => {
    store = new TodoItemStore();
  });

  it('should load todo items successfully', async () => {
    const mockTodoItems = [
      { id: 1, title: 'Test Item 1', description: 'Description 1', createdAt: new Date(), appUserId: 'user1' },
      { id: 2, title: 'Test Item 2', description: 'Description 2', createdAt: new Date(), appUserId: 'user2' }
    ];

    (agent.TodoItemsRequests.getAll as jest.Mock).mockResolvedValue(mockTodoItems);

    await store.loadTodoItems();

    expect(store.todoItems.length).toBe(2); 
    expect(store.todoItems[0].title).toBe('Test Item 1');
    expect(store.loadingInitial).toBe(false); 
  });

  it('should handle API failure on loadTodoItems', async () => {
    (agent.TodoItemsRequests.getAll as jest.Mock).mockRejectedValue(new Error('API error'));

    await store.loadTodoItems();

    expect(store.todoItems.length).toBe(0);
    expect(store.loadingInitial).toBe(false); 
  });

  it('should add a new todo item successfully', async () => {
    const newTodo = { id: 3, title: 'New Todo', description: 'New Description', createdAt: new Date(), appUserId: 'user3' };

    (agent.TodoItemsRequests.create as jest.Mock).mockResolvedValue(newTodo);

    await store.createTodoItem({
      title: 'New Todo',
      description: 'New Description',
      createdAt: new Date,
      appUserId: "user1"
    });

    expect(store.todoItems).toContainEqual(newTodo); 
    expect(store.loading).toBe(false);
  });

  it('should delete a todo item successfully', async () => {
    store.todoItems = [
      { id: 1, title: 'Test Item 1', description: 'Description 1', createdAt: new Date(), appUserId: 'user1' },
      { id: 2, title: 'Test Item 2', description: 'Description 2', createdAt: new Date(), appUserId: 'user2' }
    ];

    (agent.TodoItemsRequests.delete as jest.Mock).mockResolvedValue(1);

    await store.deleteTodoItem(1);

    expect(store.todoItems.length).toBe(1); 
    expect(store.todoItems[0].id).toBe(2);
  });
});
