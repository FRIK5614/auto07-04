
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CarDetails from "./pages/CarDetails";
import CompareCars from "./pages/CompareCars";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import TmcAvtoCatalog from "./components/TmcAvtoCatalog";
import { AdminProvider } from "./contexts/AdminContext";
import { CarsProvider } from "./contexts/CarsContext";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminImport from "./pages/AdminImport";
import AdminCars from "./pages/AdminCars";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  return (
    <>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/compare" element={<CompareCars />} />
          <Route path="/favorites" element={<Favorites />} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tmcavto-catalog" element={<TmcAvtoCatalog />} />
            <Route path="cars" element={<AdminCars />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="import" element={<AdminImport />} />
            <Route path="settings" element={<AdminDashboard />} />
          </Route>
          
          {/* Redirect old route to admin panel */}
          <Route path="/tmcavto-catalog" element={<AdminLogin />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminProvider>
          <CarsProvider>
            <AppContent />
          </CarsProvider>
        </AdminProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
