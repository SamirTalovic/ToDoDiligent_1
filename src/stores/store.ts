import { createContext, useContext } from "react";
import CommonStore from "./commonStore";
import { useUserStore } from "./userStore";
import { useTodoItemStore } from "./todoStore";


interface Store {
  commonStore: CommonStore;
  userStore: typeof useUserStore;
  todoStore: typeof useTodoItemStore;
}

export const store: Store = {
  commonStore: new CommonStore(),
  userStore: useUserStore,
  todoStore: useTodoItemStore
};



export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}