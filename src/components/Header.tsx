
import { Link } from "react-router-dom";
import { useCars } from "@/hooks/useCars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Heart, 
  Search, 
  Menu, 
  X,
  ChevronDown 
} from "lucide-react";
import { useState } from "react";

const Header = () => {
  const { favoriteCars, comparisonCars } = useCars();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Car className="h-8 w-8 text-auto-blue-600" />
          <span className="text-2xl font-bold text-auto-gray-900">АвтоКаталог</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-auto-gray-700 hover:text-auto-blue-600 font-medium">
            Главная
          </Link>
          <div className="relative group">
            <button className="flex items-center space-x-1 text-auto-gray-700 hover:text-auto-blue-600 font-medium">
              <span>Каталог</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-md py-2 hidden group-hover:block">
              <Link to="/" className="block px-4 py-2 text-auto-gray-700 hover:bg-auto-blue-50">
                Все автомобили
              </Link>
              <Link to="/?filter=new" className="block px-4 py-2 text-auto-gray-700 hover:bg-auto-blue-50">
                Новые автомобили
              </Link>
              <Link to="/?bodyType=sedan" className="block px-4 py-2 text-auto-gray-700 hover:bg-auto-blue-50">
                Седаны
              </Link>
              <Link to="/?bodyType=suv" className="block px-4 py-2 text-auto-gray-700 hover:bg-auto-blue-50">
                Внедорожники
              </Link>
            </div>
          </div>
          <Link to="/compare" className="text-auto-gray-700 hover:text-auto-blue-600 font-medium">
            Сравнение
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/search">
            <Button variant="outline" size="icon" className="relative rounded-full h-10 w-10">
              <Search className="h-5 w-5 text-auto-gray-700" />
            </Button>
          </Link>
          <Link to="/favorites">
            <Button variant="outline" size="icon" className="relative rounded-full h-10 w-10">
              <Heart className="h-5 w-5 text-auto-gray-700" />
              {favoriteCars.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-auto-blue-600">
                  {favoriteCars.length}
                </Badge>
              )}
            </Button>
          </Link>
          <Link to="/compare">
            <Button variant="outline" size="icon" className="relative rounded-full h-10 w-10">
              <Car className="h-5 w-5 text-auto-gray-700" />
              {comparisonCars.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-auto-blue-600">
                  {comparisonCars.length}
                </Badge>
              )}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="flex flex-col py-2">
            <Link 
              to="/" 
              className="px-4 py-3 text-auto-gray-700 hover:bg-auto-blue-50"
              onClick={toggleMenu}
            >
              Главная
            </Link>
            <Link 
              to="/" 
              className="px-4 py-3 text-auto-gray-700 hover:bg-auto-blue-50"
              onClick={toggleMenu}
            >
              Все автомобили
            </Link>
            <Link 
              to="/?filter=new" 
              className="px-4 py-3 text-auto-gray-700 hover:bg-auto-blue-50"
              onClick={toggleMenu}
            >
              Новые автомобили
            </Link>
            <Link 
              to="/compare" 
              className="px-4 py-3 text-auto-gray-700 hover:bg-auto-blue-50"
              onClick={toggleMenu}
            >
              Сравнение
            </Link>
            <Link 
              to="/favorites" 
              className="px-4 py-3 text-auto-gray-700 hover:bg-auto-blue-50"
              onClick={toggleMenu}
            >
              Избранное
              {favoriteCars.length > 0 && (
                <Badge className="ml-2 bg-auto-blue-600">{favoriteCars.length}</Badge>
              )}
            </Link>
            <Link 
              to="/search" 
              className="px-4 py-3 text-auto-gray-700 hover:bg-auto-blue-50"
              onClick={toggleMenu}
            >
              Поиск
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
