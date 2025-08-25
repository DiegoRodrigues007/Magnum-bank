import { lazy, Suspense, type ReactElement } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAppSelector } from "./store/hooks";
import DashboardLayout from "./layouts/DashboardLayout";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const Transfer = lazy(() => import("./pages/Transfer"));
const History = lazy(() => import("./pages/StatementPage"));

const withSuspense = (el: ReactElement) => (
  <Suspense fallback={<div>Carregando...</div>}>{el}</Suspense>
);

function ProtectedRoute() {
  const token = useAppSelector((s) => s.auth.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  { path: "/login", element: withSuspense(<Login />) },
  { path: "/register", element: withSuspense(<Register />) },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: withSuspense(<Home />) },
          { path: "transfer", element: withSuspense(<Transfer />) },
          { path: "history", element: withSuspense(<History />) },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
