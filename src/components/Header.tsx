
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useCars } from '../hooks/useCars';
import { useSettings } from '../hooks/useSettings';
import { Button } from './ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip';
import { Heart, Menu, ShoppingCart, Flame, X } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAdmin();
  const { favoriteCarIds, compareCarIds } = useCars();
  const { settings } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const logoUrl = settings?.companyLogo || '/placeholder.svg';
  const companyName = settings?.companyName || 'Автосалон';
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Add scroll event listener to detect when page is scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <header className={`bg-white shadow-sm sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src={logoUrl} 
                alt={companyName} 
                className="h-10 w-auto object-contain mr-2" 
              />
              <span className="text-xl font-semibold">{companyName}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'
              }`}
            >
              Главная
            </Link>
            <Link 
              to="/catalog" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/catalog' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'
              }`}
            >
              Каталог
            </Link>
            <Link 
              to="/hot-deals" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/hot-deals' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'
              }`}
            >
              Горячие предложения
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname.startsWith('/admin') ? 'text-primary border-b-2 border-primary' : 'text-gray-600'
                }`}
              >
                Админ панель
              </Link>
            )}
          </nav>
          
          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              {/* Hot Deals button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    asChild
                    className="relative"
                  >
                    <Link to="/hot-deals">
                      <Flame className="h-5 w-5 text-orange-500" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Горячие предложения</p>
                </TooltipContent>
              </Tooltip>

              {/* Favorites button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    asChild
                    className="relative"
                  >
                    <Link to="/favorites">
                      <Heart className="h-5 w-5" />
                      {favoriteCarIds.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {favoriteCarIds.length}
                        </span>
                      )}
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Избранное</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Compare button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    size="icon"
                    asChild
                    className="relative"
                  >
                    <Link to="/compare">
                      <ShoppingCart className="h-5 w-5" />
                      {compareCarIds.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {compareCarIds.length}
                        </span>
                      )}
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Сравнение</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Mobile menu button */}
            <Button 
              variant="outline" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-2 space-y-2">
            <Link 
              to="/" 
              className={`block py-2 px-4 rounded-md ${
                location.pathname === '/' ? 'bg-primary/10 text-primary' : ''
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Главная
            </Link>
            <Link 
              to="/catalog" 
              className={`block py-2 px-4 rounded-md ${
                location.pathname === '/catalog' ? 'bg-primary/10 text-primary' : ''
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Каталог
            </Link>
            <Link 
              to="/hot-deals" 
              className={`block py-2 px-4 rounded-md ${
                location.pathname === '/hot-deals' ? 'bg-primary/10 text-primary' : ''
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Горячие предложения
            </Link>
            <Link 
              to="/favorites" 
              className={`block py-2 px-4 rounded-md ${
                location.pathname === '/favorites' ? 'bg-primary/10 text-primary' : ''
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Избранное
            </Link>
            <Link 
              to="/compare" 
              className={`block py-2 px-4 rounded-md ${
                location.pathname === '/compare' ? 'bg-primary/10 text-primary' : ''
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Сравнение
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`block py-2 px-4 rounded-md ${
                  location.pathname.startsWith('/admin') ? 'bg-primary/10 text-primary' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Админ панель
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
