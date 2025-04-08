
import React, { useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import { formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, MoreVertical, RefreshCw } from "lucide-react";

const OrdersTable = () => {
  const { orders, loading, syncOrders, processOrder, deleteOrder } = useOrderManagement();
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  useEffect(() => {
    syncOrders();
  }, [syncOrders]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500">Новый</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500">В обработке</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Выполнен</Badge>;
      case "canceled":
        return <Badge className="bg-red-500">Отменен</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleDelete = async () => {
    if (selectedOrderId) {
      await deleteOrder(selectedOrderId);
      setIsDeleteDialogOpen(false);
      setSelectedOrderId(null);
    }
  };
  
  const confirmDelete = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Заказы</h2>
        <Button 
          onClick={() => syncOrders()}
          variant="outline"
          className="flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Обновить
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
            <p className="text-sm text-gray-500">Загрузка заказов...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center p-6 border border-dashed rounded-lg">
          <p className="text-gray-500">Заказы не найдены</p>
          <Button 
            onClick={() => syncOrders()}
            variant="outline"
            className="mt-2"
          >
            Обновить
          </Button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-md overflow-hidden">
          <Table>
            <TableCaption>Список заказов клиентов</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Контакты</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    <div>{order.customerPhone}</div>
                    <div className="text-xs text-gray-500">{order.customerEmail}</div>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Открыть меню</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => processOrder(order.id, "new")}
                          disabled={order.status === "new"}
                        >
                          Отметить как новый
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => processOrder(order.id, "processing")}
                          disabled={order.status === "processing"}
                        >
                          Отметить как в обработке
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => processOrder(order.id, "completed")}
                          disabled={order.status === "completed"}
                        >
                          Отметить как выполненный
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => processOrder(order.id, "canceled")}
                          disabled={order.status === "canceled"}
                        >
                          Отметить как отмененный
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => confirmDelete(order.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          Удалить заказ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Данное действие удалит заказ из системы. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OrdersTable;
