
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Car, 
  ClipboardList, 
  Upload, 
  Settings, 
  LogOut 
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAdmin();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const linkClass = "flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors";
  const activeLinkClass = "flex items-center py-2 px-3 bg-gray-100 text-primary font-medium rounded-md";

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Админ панель</h1>
      </div>
      <nav className="py-4 flex-1">
        <ul className="space-y-1 px-3">
          <li>
            <Link 
              to="/admin" 
              className={isActive("/admin") ? activeLinkClass : linkClass}
            >
              <LayoutDashboard size={18} className="mr-2" />
              Дашборд
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/cars" 
              className={isActive("/admin/cars") ? activeLinkClass : linkClass}
            >
              <Car size={18} className="mr-2" />
              Автомобили
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/orders" 
              className={isActive("/admin/orders") ? activeLinkClass : linkClass}
            >
              <ClipboardList size={18} className="mr-2" />
              Заказы
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/import" 
              className={isActive("/admin/import") ? activeLinkClass : linkClass}
            >
              <Upload size={18} className="mr-2" />
              Импорт
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/settings" 
              className={isActive("/admin/settings") ? activeLinkClass : linkClass}
            >
              <Settings size={18} className="mr-2" />
              Настройки
            </Link>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t">
        <button 
          onClick={logout}
          className="flex items-center text-red-600 hover:text-red-800 transition-colors"
        >
          <LogOut size={18} className="mr-2" />
          Выйти
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
