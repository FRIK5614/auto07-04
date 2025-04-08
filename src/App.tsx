
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Index from "./pages/Index";
import CarDetails from "./pages/CarDetails";
import CompareCars from "./pages/CompareCars";
import Favorites from "./pages/Favorites";
import HotDeals from "./pages/HotDeals"; // New import
import AdminDashboard from "./pages/AdminDashboard";
import AdminCars from "./pages/AdminCars";
import AdminOrders from "./pages/AdminOrders";
import AdminLogin from "./pages/AdminLogin";
import AdminImport from "./pages/AdminImport";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

import AdminLayout from "./components/AdminLayout";

import { CarsProvider } from "./contexts/CarsContext";
import { AdminProvider } from "./contexts/AdminContext";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <CarsProvider>
        <AdminProvider>
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/car/:id" element={<CarDetails />} />
            <Route path="/compare" element={<CompareCars />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/hot-deals" element={<HotDeals />} /> {/* New route */}
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="cars" element={<AdminCars />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="import" element={<AdminImport />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="login" element={<AdminLogin />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminProvider>
      </CarsProvider>
    </Router>
  );
}

export default App;
