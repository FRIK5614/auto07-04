
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { 
  CarFront, 
  LogOut, 
  Cog, 
  ShoppingCart, 
  BarChart3, 
  FileArchive, 
  Package,
  MessageCircle,
  Menu
} from 'lucide-react';
import { useCars } from '@/hooks/useCars';
import { useChat } from '@/contexts/ChatContext';
import { useToast } from '@/hooks/use-toast';

const AdminLayout = () => {
  const { isAdmin, logout } = useAdmin();
  const { orders } = useCars();
  const { chatState } = useChat();
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  // Count new orders for the badge
  useEffect(() => {
    if (orders && orders.length > 0) {
      const count = orders.filter(order => order.status === 'new').length;
      setNewOrdersCount(count);
    }
  }, [orders]);

  // Count unread messages for the badge
  useEffect(() => {
    const totalUnread = chatState.sessions.reduce((total, session) => total + session.unreadCount, 0);
    setNewMessagesCount(totalUnread);
    
    // Show notification for new messages
    if (totalUnread > 0 && location.pathname !== '/admin/chat') {
      toast({
        title: "Новые сообщения",
        description: `У вас ${totalUnread} непрочитанных сообщений`,
        action: <Button variant="secondary" size="sm" onClick={() => navigate('/admin/chat')}>Перейти</Button>
      });
    }
  }, [chatState.sessions, location.pathname, navigate, toast]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  // Redirect to login if not admin - early return
  if (!isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  const handleMenuItemClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  // Check if the current path matches the menu item
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/admin' && location.pathname.startsWith(path));
  };

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Админ панель</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile sidebar (conditionally rendered) */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="bg-background h-full w-64 p-4 overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Меню</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Управление</h3>
                  <div className="space-y-1">
                    <Button 
                      variant={isActive('/admin') || isActive('/admin/dashboard') ? 'secondary' : 'ghost'} 
                      className="w-full justify-start" 
                      onClick={(e) => handleMenuItemClick(e as any, "/admin")}
                    >
                      <BarChart3 className="h-5 w-5 mr-2" />
                      <span>Главная</span>
                    </Button>
                    <Button 
                      variant={isActive('/admin/cars') ? 'secondary' : 'ghost'} 
                      className="w-full justify-start" 
                      onClick={(e) => handleMenuItemClick(e as any, "/admin/cars")}
                    >
                      <CarFront className="h-5 w-5 mr-2" />
                      <span>Автомобили</span>
                    </Button>
                    <Button 
                      variant={isActive('/admin/orders') ? 'secondary' : 'ghost'} 
                      className="w-full justify-start" 
                      onClick={(e) => handleMenuItemClick(e as any, "/admin/orders")}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      <span>Заказы</span>
                      {newOrdersCount > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          {newOrdersCount}
                        </span>
                      )}
                    </Button>
                    <Button 
                      variant={isActive('/admin/chat') ? 'secondary' : 'ghost'} 
                      className="w-full justify-start" 
                      onClick={(e) => handleMenuItemClick(e as any, "/admin/chat")}
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      <span>Чат</span>
                      {newMessagesCount > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          {newMessagesCount}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Импорт/Экспорт</h3>
                  <div className="space-y-1">
                    <Button 
                      variant={isActive('/admin/import') ? 'secondary' : 'ghost'} 
                      className="w-full justify-start" 
                      onClick={(e) => handleMenuItemClick(e as any, "/admin/import")}
                    >
                      <FileArchive className="h-5 w-5 mr-2" />
                      <span>Импорт данных</span>
                    </Button>
                    <Button 
                      variant={isActive('/admin/tmcavto-catalog') ? 'secondary' : 'ghost'} 
                      className="w-full justify-start" 
                      onClick={(e) => handleMenuItemClick(e as any, "/admin/tmcavto-catalog")}
                    >
                      <Package className="h-5 w-5 mr-2" />
                      <span>Каталог TMC Авто</span>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Система</h3>
                  <div className="space-y-1">
                    <Button 
                      variant={isActive('/admin/settings') ? 'secondary' : 'ghost'} 
                      className="w-full justify-start" 
                      onClick={(e) => handleMenuItemClick(e as any, "/admin/settings")}
                    >
                      <Cog className="h-5 w-5 mr-2" />
                      <span>Настройки</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  variant="default" 
                  className="w-full" 
                  onClick={() => {
                    logout();
                    toast({
                      title: "Выход выполнен",
                      description: "Вы вышли из панели администратора"
                    });
                    navigate('/');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold">Панель администратора</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Управление</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      className={isActive('/admin') || isActive('/admin/dashboard') ? 'bg-accent text-accent-foreground' : ''}
                    >
                      <a href="#" onClick={(e) => handleMenuItemClick(e, "/admin")}>
                        <BarChart3 className="h-5 w-5" />
                        <span>Главная</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild
                      className={isActive('/admin/cars') ? 'bg-accent text-accent-foreground' : ''}
                    >
                      <a href="#" onClick={(e) => handleMenuItemClick(e, "/admin/cars")}>
                        <CarFront className="h-5 w-5" />
                        <span>Автомобили</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild
                      className={isActive('/admin/orders') ? 'bg-accent text-accent-foreground' : ''}
                    >
                      <a href="#" onClick={(e) => handleMenuItemClick(e, "/admin/orders")}>
                        <ShoppingCart className="h-5 w-5" />
                        <span>Заказы</span>
                        {newOrdersCount > 0 && (
                          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            {newOrdersCount}
                          </span>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild
                      className={isActive('/admin/chat') ? 'bg-accent text-accent-foreground' : ''}
                    >
                      <a href="#" onClick={(e) => handleMenuItemClick(e, "/admin/chat")}>
                        <MessageCircle className="h-5 w-5" />
                        <span>Чат</span>
                        {newMessagesCount > 0 && (
                          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            {newMessagesCount}
                          </span>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel>Импорт/Экспорт</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild
                      className={isActive('/admin/import') ? 'bg-accent text-accent-foreground' : ''}
                    >
                      <a href="#" onClick={(e) => handleMenuItemClick(e, "/admin/import")}>
                        <FileArchive className="h-5 w-5" />
                        <span>Импорт данных</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild
                      className={isActive('/admin/tmcavto-catalog') ? 'bg-accent text-accent-foreground' : ''}
                    >
                      <a href="#" onClick={(e) => handleMenuItemClick(e, "/admin/tmcavto-catalog")}>
                        <Package className="h-5 w-5" />
                        <span>Каталог TMC Авто</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel>Система</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild
                      className={isActive('/admin/settings') ? 'bg-accent text-accent-foreground' : ''}
                    >
                      <a href="#" onClick={(e) => handleMenuItemClick(e, "/admin/settings")}>
                        <Cog className="h-5 w-5" />
                        <span>Настройки</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                logout();
                toast({
                  title: "Выход выполнен",
                  description: "Вы вышли из панели администратора"
                });
                navigate('/');
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-background flex-1 p-0 md:p-6 mt-[60px] md:mt-0">
          <div className="container mx-auto">
            <SidebarTrigger className="mb-4 hidden md:flex" />
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
