
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CarFront } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Панель администратора</h1>
        <p className="text-muted-foreground mt-2">
          Управление каталогом автомобилей и другими функциями сайта
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Каталог автомобилей
            </CardTitle>
            <CarFront className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">TMC Авто</div>
            <p className="text-xs text-muted-foreground mt-1">
              Управление импортом автомобилей из каталога
            </p>
            <div className="mt-4">
              <Link 
                to="/admin/tmcavto-catalog" 
                className="text-sm text-blue-600 hover:underline"
              >
                Перейти к управлению
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
