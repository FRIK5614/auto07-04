
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";
import { useCars } from "@/hooks/useCars";
import { Home, Car, Flame, Heart, BarChart3, Loader2 } from "lucide-react";

const Header = () => {
  const { isAdmin } = useAdmin();
  const { isLoading } = useCars();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          AutoDeal
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </Link>
        <nav>
          <ul className="flex flex-wrap space-x-4">
            <li>
              <Link to="/" className="flex items-center gap-1 hover:text-blue-600">
                <Home className="h-4 w-4" /> Главная
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="flex items-center gap-1 hover:text-blue-600">
                <Car className="h-4 w-4" /> Каталог
              </Link>
            </li>
            <li>
              <Link to="/hot-deals" className="flex items-center gap-1 hover:text-blue-600">
                <Flame className="h-4 w-4" /> Горячие предложения
              </Link>
            </li>
            <li>
              <Link to="/compare" className="flex items-center gap-1 hover:text-blue-600">
                <BarChart3 className="h-4 w-4" /> Сравнение
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="flex items-center gap-1 hover:text-blue-600">
                <Heart className="h-4 w-4" /> Избранное
              </Link>
            </li>
            {isAdmin && (
              <li><Link to="/admin" className="hover:text-blue-600">Админ панель</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
