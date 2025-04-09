import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './App.css';
import MainPage from './pages/MainPage';
import CarPage from './pages/CarPage';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import AdminCars from './pages/AdminCars';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';
import AdminImport from './pages/AdminImport';
import AdminLayout from './components/AdminLayout';
import { AdminProvider } from './contexts/AdminContext';
import { CarsProvider } from './contexts/CarsContext';
import FavoritesPage from './pages/FavoritesPage';
import ComparePage from './pages/ComparePage';
import OrderPage from './pages/OrderPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminCheckCars from './pages/AdminCheckCars'; // Добавляем импорт новой страницы

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/car/:id",
    element: <CarPage />,
  },
  {
    path: "/favorites",
    element: <FavoritesPage />,
  },
  {
    path: "/compare",
    element: <ComparePage />,
  },
  {
    path: "/order",
    element: <OrderPage />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: (
      <AdminProvider>
        <AdminLayout>
          <AdminPanel />
        </AdminLayout>
      </AdminProvider>
    ),
  },
  {
    path: "/admin/cars",
    element: (
      <AdminProvider>
        <AdminLayout>
          <AdminCars />
        </AdminLayout>
      </AdminProvider>
    ),
  },
  {
    path: "/admin/orders",
    element: (
      <AdminProvider>
        <AdminLayout>
          <AdminOrders />
        </AdminLayout>
      </AdminProvider>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <AdminProvider>
        <AdminLayout>
          <AdminSettings />
        </AdminLayout>
      </AdminProvider>
    ),
  },
  {
    path: "/admin/import",
    element: (
      <AdminProvider>
        <AdminLayout>
          <AdminImport />
        </AdminLayout>
      </AdminProvider>
    ),
  },
  // Добавляем новый маршрут для проверки автомобилей в БД
  {
    path: "/admin/check-cars",
    element: (
      <AdminProvider>
        <AdminLayout>
          <AdminCheckCars />
        </AdminLayout>
      </AdminProvider>
    ),
  },
]);

function App() {
  return (
    <CarsProvider>
      <RouterProvider router={router} />
    </CarsProvider>
  );
}

export default App;
