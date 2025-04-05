
import { Navigate, Outlet } from 'react-router-dom';
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
  Package
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCars } from '@/hooks/useCars';

const AdminLayout = () => {
  const { isAdmin, logout } = useAdmin();
  const { orders } = useCars();
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  // Count new orders for the badge
  useEffect(() => {
    const count = orders.filter(order => order.status === 'new').length;
    setNewOrdersCount(count);
  }, [orders]);

  // Redirect to login if not admin
  if (!isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <Sidebar>
          <SidebarHeader className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold">Панель администратора</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Управление</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin">
                        <BarChart3 className="h-5 w-5" />
                        <span>Главная</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/cars">
                        <CarFront className="h-5 w-5" />
                        <span>Автомобили</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/orders">
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
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel>Импорт/Экспорт</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/import">
                        <FileArchive className="h-5 w-5" />
                        <span>Импорт данных</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/tmcavto-catalog">
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
                    <SidebarMenuButton asChild>
                      <a href="/admin/settings">
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
                window.location.href = '/';
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-background flex-1 p-6">
          <div className="container mx-auto">
            <SidebarTrigger className="mb-4" />
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
