import { RouteObject, createBrowserRouter } from "react-router-dom";
import App from "../App";
import RequireAuth from "./RequireAuth";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <RequireAuth />,
        children: [
          // protected routes here
        ],
      },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
