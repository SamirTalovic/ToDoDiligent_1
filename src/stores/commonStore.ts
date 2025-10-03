import { makeAutoObservable, reaction } from "mobx";
import { ServerError } from "../common/interfaces/CommonInterface";

export default class CommonStore {
  token: string | null = window.localStorage.getItem("jwt");
  serverError: ServerError | null = null;
  appLoaded: boolean = false;

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.token,
      (token) => {
        if (token) {
          window.localStorage.setItem("jwt", token);
        } else {
          window.localStorage.removeItem("jwt");
        }
      }
    );
  }

  setServerError = (error: ServerError) => {
    this.serverError = error;
  };

setToken = (token: string | null) => {
  this.token = token;
  if (token) {
    window.localStorage.setItem("jwt", token);
  } else {
    window.localStorage.removeItem("jwt");
  }
};


  removeToken = () => {
    this.token = null;
    localStorage.removeItem("jwt");
  };

  setAppLoaded = () => {
    this.appLoaded = true;
  };
}
