import React, { useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, Car, ShoppingCart, Settings, FileDown, Database } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { path: '/admin', label: 'Дашборд', icon: <Home size={18} /> },
    { path: '/admin/cars', label: 'Автомобили', icon: <Car size={18} /> },
    { path: '/admin/orders', label: 'Заказы', icon: <ShoppingCart size={18} /> },
    { path: '/admin/check-cars', label: 'Проверка БД', icon: <Database size={18} /> }, // Добавляем новый пункт меню
    { path: '/admin/import', label: 'Импорт', icon: <FileDown size={18} /> },
    { path: '/admin/settings', label: 'Настройки', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </div>
        <nav className="flex-grow">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="hover:bg-gray-700">
                <Link
                  to={item.path}
                  className={`flex items-center p-4 ${location.pathname === item.path ? 'bg-gray-700' : ''}`}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-x-hidden overflow-y-auto">
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
