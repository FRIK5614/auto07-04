
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import CarDetails from './pages/CarDetails';
import Favorites from './pages/Favorites';
import CompareCars from './pages/CompareCars';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCars from './pages/AdminCars';
import AdminOrders from './pages/AdminOrders';
import AdminImport from './pages/AdminImport';
import AdminSettings from './pages/AdminSettings';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import { AdminProvider } from './contexts/AdminContext';
import { CarsProvider } from './contexts/CarsContext';
import { Toaster } from './components/ui/toaster';
import Catalog from './pages/Catalog';
import DeepSeekDemo from './pages/DeepSeekDemo';

function App() {
  return (
    <BrowserRouter>
      <CarsProvider>
        <AdminProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/car/:id" element={<CarDetails />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/compare" element={<CompareCars />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/deepseek" element={<DeepSeekDemo />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="cars" element={<AdminCars />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="import" element={<AdminImport />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Routes>
                  </AdminLayout>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </AdminProvider>
      </CarsProvider>
    </BrowserRouter>
  );
}

export default App;
