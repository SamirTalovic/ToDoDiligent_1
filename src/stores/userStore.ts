// userStore.ts
import { create } from "zustand";
import { User } from "../common/interfaces/UserInterface";
import { LoginRequestDto } from "../common/interfaces/AuthInterface";
import agent from "../api/agent";
import { store } from "./store";
import { router } from "../router/NewRouter";

interface UserStoreState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getUser: () => Promise<void>;
  setUser: (user: User) => void;
  refreshToken: () => Promise<void>;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  user: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const loginRequest: LoginRequestDto = { email, password };
      const response = await agent.AccountRequests.login(loginRequest);

      // Save access token in memory
      store.commonStore.setToken(response.token);

      set({
        user: {
          id: response.id,
          name: response.name,
          email: response.email,
          token: response.token
        }
      });

      router.navigate("/");
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setUser: (user) => set({ user }),

  logout: () => {
    store.commonStore.removeToken();
    set({ user: null });
    router.navigate("/login");
  },

  getUser: async () => {
    set({ loading: true });
    try {
      const response = await agent.AccountRequests.current();
      set({
        user: {
          id: response.id,
          name: response.name,
          email: response.email,
          token: response.token
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  refreshToken: async () => {
    try {
      const response = await agent.AccountRequests.refreshToken(); // backend returns new access token + optionally user info
      store.commonStore.setToken(response.token);

       set((state) => ({
      user: state.user
        ? { ...state.user, token: response.token } // keep existing info
        : null
    }));
      console.log("Access token refreshed");
    } catch (err) {
      console.error("Refresh token failed, logging out");
      get().logout();
    }
  }
}));
