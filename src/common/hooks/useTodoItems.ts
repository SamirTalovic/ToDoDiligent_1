import { useQuery } from 'react-query';
import agent from '../../api/agent';
import { TodoItem } from '../interfaces/TodoItemInterface';

const useTodoItems = () => {
  return useQuery<TodoItem[], Error>('todoItems', agent.TodoItemsRequests.getAll);
};

export default useTodoItems;
