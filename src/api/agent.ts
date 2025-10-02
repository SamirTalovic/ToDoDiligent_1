import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { store } from "../stores/store";
import { AuthUserDto, LoginRequestDto, LoginResponseDto, RegisterRequestDto } from "../common/interfaces/AuthInterface";
import { CreateTodoItem, TodoItem } from "../common/interfaces/TodoItemInterface";
import { useUserStore } from "../stores/userStore";

// Base URL
axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL;
axios.defaults.withCredentials = true; // ⬅️ always send cookies

// Extract response data
const responseBody = <T>(response: AxiosResponse<T>) => response.data;

// ----- Refresh token queue logic -----
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

// ----- Request interceptor: attach JWT -----
axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.commonStore.token;
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
// ----- Response interceptor: refresh token -----
axios.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await AccountRequests.refreshToken();

        // Update MobX store with new token & user info
        store.commonStore.setToken(refreshResponse.token);
        useUserStore.getState().setUser(refreshResponse);

        processQueue(null, refreshResponse.token);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.token}`;
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
       useUserStore.getState().logout();
        toast.info("Session expired. Please login again.");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    switch (status) {
      case 400:
        toast.error(typeof error.response?.data === "string" ? error.response?.data : "Bad Request");
        break;
      case 403:
        toast.error("Error 403: Forbidden");
        break;
      case 404:
        toast.error("Error 404: Not Found");
        break;
    }

    return Promise.reject(error);
  }
);

// ----- Generic requests -----
const requests = {
  get: <T>(url: string) => axios.get<T>(url).then(responseBody),
  post: <T>(url: string, body: object = {}) => 
  axios.post<T>(url, body, { withCredentials: true }).then(responseBody),
  put: <T>(url: string, body: object) => axios.put<T>(url, body).then(responseBody),
  del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
};

// ----- Account APIs -----
const AccountRequests = {
  current: () => requests.get<AuthUserDto>("/account"),
  login: (user: LoginRequestDto) => requests.post<LoginResponseDto>("/account/login", user),
  register: (user: RegisterRequestDto) => requests.post<AuthUserDto>("/account/register", user),
  refreshToken: () => axios.post<AuthUserDto>(
    "/account/refreshToken",
    {},
    { withCredentials: true } // ✅ crucial
).then(response => response.data)
};

// ----- TodoItems APIs -----
const TodoItemsRequests = {
  getAll: () => requests.get<TodoItem[]>("/todoitems"),
  create: (todoItem: CreateTodoItem) => requests.post<TodoItem>("/todoitems", todoItem),
  getById: (id: number) => requests.get<TodoItem>(`/todoitems/${id}`),
  update: (id: number, todoItem: TodoItem) => requests.put<TodoItem>(`/todoitems/${id}`, todoItem),
  delete: (id: number) => requests.del<void>(`/todoitems/${id}`),
  bulkComplete: (ids: number[]) => requests.post<void>("/todoitems/bulk-complete", ids)
};

const agent = {
  AccountRequests,
  TodoItemsRequests
};

export default agent;
