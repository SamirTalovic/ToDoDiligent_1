import axios from 'axios';
import agent from '../api/agent';
import { CreateTodoItem } from '../common/interfaces/TodoItemInterface';

// Mock axios for requests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('agent.TodoItemsRequests', () => {
  it('should fetch all todo items', async () => {
    const mockTodoItems = [
      { id: 1, title: 'Test Item 1', description: 'Description 1', createdAt: new Date(), appUserId: 'user1' },
      { id: 2, title: 'Test Item 2', description: 'Description 2', createdAt: new Date(), appUserId: 'user2' }
    ];

    mockedAxios.get.mockResolvedValue({ data: mockTodoItems });

    const result = await agent.TodoItemsRequests.getAll();
    expect(result).toEqual(mockTodoItems);
  });

  it('should create a new todo item', async () => {
    const newTodo: CreateTodoItem = { title: 'New Todo', description: 'New Description',createdAt: new Date,appUserId :"user1" };
    const createdTodo = { id: 3, title: 'New Todo', description: 'New Description', createdAt: new Date(), appUserId: 'user3' };

    mockedAxios.post.mockResolvedValue({ data: createdTodo });

    const result = await agent.TodoItemsRequests.create(newTodo);
    expect(result).toEqual(createdTodo);
  });

  it('should delete a todo item', async () => {
    mockedAxios.delete.mockResolvedValue({});

    await agent.TodoItemsRequests.delete(1);
    expect(mockedAxios.delete).toHaveBeenCalledWith('/TodoItems/1');
  });
});
