import { create } from "zustand";
import * as signalR from "@microsoft/signalr";
import { CreateTodoItem, TodoItem } from "../common/interfaces/TodoItemInterface";
import agent from "../api/agent";
import { store } from "./store";
import { AuthUserDto } from "../common/interfaces/AuthInterface";

interface TodoItemStoreState {
  todoItems: TodoItem[];
  loading: boolean;
  hubConnection: signalR.HubConnection | null;
  initializeSignalRConnection: () => void;
  loadTodoItems: () => Promise<void>;
  
  createTodoItem: (todoItem: CreateTodoItem) => Promise<void>;
  updateTodoItem: (todoItem: TodoItem) => Promise<void>;
  deleteTodoItem: (id: number) => Promise<void>;
  bulkCompleteTodos: (ids: number[]) => Promise<void>;
  
}
interface UserStoreState {
  user: AuthUserDto | null;
  setUser: (user: AuthUserDto | null) => void;
  logout: () => void;
}
export const useUserStore = create<UserStoreState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  logout: () => set({ user: null })
}));
export const useTodoItemStore = create<TodoItemStoreState>((set, get) => ({
  todoItems: [],
  loading: false,
  hubConnection: null,

  initializeSignalRConnection: () => {
    if (get().hubConnection) return;


    const user = store.userStore.getState().user;
    if (!user?.token) {
      console.error("Cannot start SignalR: user token missing");
      return;
    } 

    const hubConnection = new signalR.HubConnectionBuilder()
     .withUrl("https://localhost:7069/todoHub", {
    accessTokenFactory: () => store.commonStore.token ?? ""
  })
      .withAutomaticReconnect()
      .build();

    hubConnection.on(
      "ReceiveTodoUpdate",
      (
        id: number,
        title: string,
        description: string,
        createdAt: string,
        appUserId: string,
        isCompleted: boolean,
        completedAt: string | null
      ) => {
        set((state) => {
          const newItem: TodoItem = {
            id,
            title,
            description,
            createdAt: new Date(createdAt),
            appUserId,
            isCompleted,
            completedAt: completedAt ? new Date(completedAt) : null
          };
          const exists = state.todoItems.some((item) => item.id === id);
          return {
            todoItems: exists
              ? state.todoItems.map((item) => (item.id === id ? newItem : item))
              : [newItem, ...state.todoItems]
          };
        });
      }
    );

    hubConnection.on("ReceiveTodoDelete", (deletedId: number) => {
      set((state) => ({
        todoItems: state.todoItems.filter((t) => t.id !== deletedId)
      }));
    });

    hubConnection
      .start()
      .then(() => {
        console.log("SignalR connected with auth token");
        set({ hubConnection });
      })
      .catch((err) => console.error("SignalR Connection Error:", err));
  },

  loadTodoItems: async () => {
    set({ loading: true });
    try {
      const todos = await agent.TodoItemsRequests.getAll();
      set({ todoItems: todos, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  createTodoItem: async (todoItem: CreateTodoItem) => {
  set({ loading: true });

  try {
    // Just call the API — don't add fake item
    await agent.TodoItemsRequests.create(todoItem);

    set({ loading: false }); 
    // SignalR will push the real item automatically
  } catch (error) {
    console.error(error);
    set({ loading: false });
  }
},


  updateTodoItem: async (todoItem: TodoItem) => {
    set({ loading: true });
    try {
      await agent.TodoItemsRequests.update(todoItem.id, todoItem);
      set((state) => ({
        todoItems: state.todoItems.map((t) =>
          t.id === todoItem.id ? todoItem : t
        ),
        loading: false
      }));
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  deleteTodoItem: async (id: number) => {
    set({ loading: true });
    try {
      await agent.TodoItemsRequests.delete(id);
      set((state) => ({
        todoItems: state.todoItems.filter((t) => t.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  bulkCompleteTodos: async (ids: number[]) => {
    set({ loading: true });
    try {
      await agent.TodoItemsRequests.bulkComplete(ids);
      set((state) => ({
        todoItems: state.todoItems.map((t) =>
          ids.includes(t.id)
            ? { ...t, isCompleted: true, completedAt: new Date() }
            : t
        ),
        loading: false
      }));
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  }
}));
