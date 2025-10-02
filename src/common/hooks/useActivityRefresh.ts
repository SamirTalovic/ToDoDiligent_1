import { useEffect } from "react";
import { useUserStore } from "../../stores/userStore";
import { store } from "../../stores/store";
import agent from "../../api/agent";

let hasRefreshed = false; // prevents repeated calls

export const useActivityRefresh = () => {
  useEffect(() => {
    if (hasRefreshed) return; // exit if already refreshed
    hasRefreshed = true;

    const refreshToken = async () => {
      try {
        const response = await agent.AccountRequests.refreshToken();

        // ✅ Update Zustand store with new user info
        useUserStore.getState().setUser(response);

        // ✅ Save the new access token in commonStore
        store.commonStore.setToken(response.token);

        console.log("Refresh token called, new token:", response.token);
      } catch (err) {
        console.log("Refresh token failed, logging out");
        useUserStore.getState().logout();
        store.commonStore.removeToken(); // clear old token
      }
    };

    refreshToken();
  }, []);
};
