
import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { CarFront, LogOut, Cog } from 'lucide-react';

const AdminLayout = () => {
  const { isAdmin, logout } = useAdmin();

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
                        <Cog className="h-5 w-5" />
                        <span>Главная</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/tmcavto-catalog">
                        <CarFront className="h-5 w-5" />
                        <span>Каталог TMC Авто</span>
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
