import { useQuery } from 'react-query';
import { TodoItem } from '../interfaces/TodoItemInterface';
import agent from '../../api/agent';

const useTodoItem = (id: number) => {
  return useQuery<TodoItem, Error>(['todoItem', id], () => agent.TodoItemsRequests.getById(id));
};

export default useTodoItem;
