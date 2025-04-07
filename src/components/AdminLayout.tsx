
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { useEffect } from "react";
import { 
  LayoutDashboard, 
  Car,
  ClipboardList,
  Upload,
  LogOut,
  Settings
} from "lucide-react";

const AdminLayout = () => {
  const { isAdmin, logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  // Перенаправление неавторизованных пользователей
  useEffect(() => {
    if (!isAdmin && location.pathname !== "/admin/login") {
      navigate("/admin/login");
    }
  }, [isAdmin, location.pathname, navigate]);

  // Если путь /admin/login и пользователь авторизован, перенаправляем на дашборд
  useEffect(() => {
    if (isAdmin && location.pathname === "/admin/login") {
      navigate("/admin");
    }
  }, [isAdmin, location.pathname, navigate]);

  // Отображаем только компонент Outlet для страницы входа
  if (location.pathname === "/admin/login") {
    return <Outlet />;
  }

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const linkClass = "flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors";
  const activeLinkClass = "flex items-center py-2 px-3 bg-gray-100 text-primary font-medium rounded-md";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Боковая панель */}
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

      {/* Основное содержимое */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
