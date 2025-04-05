
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";

const Header = () => {
  const { isAdmin } = useAdmin();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">AutoDeal</Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-blue-600">Главная</Link></li>
            <li><Link to="/compare" className="hover:text-blue-600">Сравнение</Link></li>
            <li><Link to="/favorites" className="hover:text-blue-600">Избранное</Link></li>
            {isAdmin && (
              <li><Link to="/admin" className="hover:text-blue-600">Админ панель</Link></li>
            )}
            {!isAdmin && (
              <li><Link to="/admin/login" className="hover:text-blue-600">Вход для администратора</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
