
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './App.css';
import Index from './pages/Index'; // Меняем с MainPage на Index
import CarDetails from './pages/CarDetails'; // Меняем с CarPage на CarDetails
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard'; // Меняем с AdminPanel на AdminDashboard
import AdminCars from './pages/AdminCars';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';
import AdminImport from './pages/AdminImport';
import AdminLayout from './components/AdminLayout';
import { AdminProvider } from './contexts/AdminContext';
import { CarsProvider } from './contexts/CarsContext';
import Favorites from './pages/Favorites'; // Меняем с FavoritesPage на Favorites
import CompareCars from './pages/CompareCars'; // Меняем с ComparePage на CompareCars
import NotFound from './pages/NotFound'; // Меняем с OrderPage и NotFoundPage на NotFound
import AdminCheckCars from './pages/AdminCheckCars'; // Добавляем импорт новой страницы

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />,
  },
  {
    path: "/car/:id",
    element: <CarDetails />,
  },
  {
    path: "/favorites",
    element: <Favorites />,
  },
  {
    path: "/compare",
    element: <CompareCars />,
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
          <AdminDashboard />
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
