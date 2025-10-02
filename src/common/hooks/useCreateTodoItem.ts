import { useMutation, useQueryClient } from 'react-query';
import agent from '../../api/agent';
import { CreateTodoItem, TodoItem } from '../interfaces/TodoItemInterface';

const useCreateTodoItem = () => {
  const queryClient = useQueryClient();

  return useMutation<TodoItem, Error, CreateTodoItem>(agent.TodoItemsRequests.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('todoItems');
    },
  });
};

export default useCreateTodoItem;
