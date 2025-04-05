import React, { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChatMessage, ChatSession } from '@/types/chat';
import { Send, MessageCircle, User, Clock, CheckCircle, MessageSquare } from 'lucide-react';

const MessageBubble: React.FC<{ message: ChatMessage; isAdmin?: boolean }> = ({ message, isAdmin = false }) => {
  const isUserMessage = message.senderType === 'user';
  const isTelegramMessage = message.senderType === 'telegram';
  
  const getMessageStyle = () => {
    switch (message.senderType) {
      case 'user':
        return 'bg-blue-100';
      case 'admin':
        return 'bg-green-100';
      case 'system':
        return 'bg-gray-100 w-full text-center';
      case 'telegram':
        return 'bg-blue-100 border-l-4 border-blue-500';
      default:
        return 'bg-gray-100';
    }
  };
  
  return (
    <div className={`flex items-start mb-3 ${isAdmin && isUserMessage ? 'justify-start' : ''}`}>
      {(isUserMessage || isTelegramMessage) && (
        <Avatar className="h-8 w-8 mr-2 mt-1">
          {isTelegramMessage ? (
            <AvatarFallback className="bg-blue-500 text-white">
              <MessageSquare className="h-4 w-4" />
            </AvatarFallback>
          ) : (
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
      )}
      
      <div className={`rounded-lg px-3 py-2 max-w-[85%] ${getMessageStyle()}`}>
        <div className="text-xs font-medium opacity-75 mb-1">
          {message.senderName} 
          {isTelegramMessage && <span className="ml-1 text-blue-500">(Telegram)</span>}
        </div>
        <div className="break-words">{message.content}</div>
        <div className="text-xs opacity-75 mt-1 text-right">
          {format(new Date(message.timestamp), 'dd.MM.yyyy HH:mm', { locale: ru })}
        </div>
      </div>
    </div>
  );
};

const AdminChat: React.FC = () => {
  const { chatState, sendMessage, setActiveSession, closeSession } = useChat();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState('');
  const [telegramConnected, setTelegramConnected] = useState(false);
  
  const { sessions, activeSessionId } = chatState;
  const activeSession = sessions.find(session => session.id === activeSessionId);
  const activeSessions = sessions.filter(session => session.status === 'active');
  const closedSessions = sessions.filter(session => session.status === 'closed');
  
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeSessionId) return;
    
    const adminMessage: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: 'admin',
      senderName: 'Менеджер',
      senderType: 'admin',
      content: messageText,
      timestamp: new Date().toISOString(),
      isRead: true
    };
    
    const updatedSessions = sessions.map(session => 
      session.id === activeSessionId 
        ? { 
            ...session, 
            messages: [...session.messages, adminMessage],
            lastActivity: new Date().toISOString()
          }
        : session
    );
    
    setActiveSession(activeSessionId);
    setMessageText('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  if (!isAdmin) {
    return null;
  }

  const totalUnread = sessions.reduce((total, session) => total + session.unreadCount, 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Чат с клиентами</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Список чатов
                {totalUnread > 0 && (
                  <Badge variant="destructive">{totalUnread}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {activeSessions.length} активных чатов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="active" className="flex-1">
                    Активные
                    {activeSessions.length > 0 && (
                      <Badge variant="secondary" className="ml-2">{activeSessions.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="flex-1">
                    Закрытые
                    {closedSessions.length > 0 && (
                      <Badge variant="outline" className="ml-2">{closedSessions.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="telegram" className="flex-1">
                    Telegram
                    <Badge variant="outline" className="ml-2">0</Badge>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="active">
                  <ScrollArea className="h-[400px]">
                    {activeSessions.length > 0 ? (
                      <div className="space-y-2">
                        {activeSessions.map(session => (
                          <Card
                            key={session.id}
                            className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                              session.id === activeSessionId ? 'border-primary' : ''
                            }`}
                            onClick={() => setActiveSession(session.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarFallback>
                                      {session.userName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{session.userName}</div>
                                    <div className="text-xs text-muted-foreground flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {format(new Date(session.lastActivity), 'HH:mm', { locale: ru })}
                                    </div>
                                  </div>
                                </div>
                                {session.unreadCount > 0 && (
                                  <Badge variant="destructive">{session.unreadCount}</Badge>
                                )}
                              </div>
                              {session.messages.length > 0 && (
                                <div className="mt-2 text-sm line-clamp-1 text-muted-foreground">
                                  {session.messages[session.messages.length - 1].content}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <p>Нет активных чатов</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="closed">
                  <ScrollArea className="h-[400px]">
                    {closedSessions.length > 0 ? (
                      <div className="space-y-2">
                        {closedSessions.map(session => (
                          <Card
                            key={session.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setActiveSession(session.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarFallback>
                                      {session.userName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{session.userName}</div>
                                    <div className="text-xs text-muted-foreground flex items-center">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Закрыт {format(new Date(session.lastActivity), 'dd.MM.yyyy', { locale: ru })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <p>Нет закрытых чатов</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="telegram">
                  <div className="h-[400px] flex flex-col items-center justify-center">
                    {telegramConnected ? (
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                          <MessageSquare className="h-12 w-12 text-blue-500" />
                        </div>
                        <h3 className="font-medium mb-1">Telegram подключен</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Бот активен и готов получать сообщения
                        </p>
                        <Button variant="outline" onClick={() => setTelegramConnected(false)}>
                          Отключить Telegram
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                          <MessageSquare className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium mb-1">Telegram не подключен</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Для получения сообщений из Telegram подключите бота
                        </p>
                        <Button onClick={() => setTelegramConnected(true)}>
                          Подключить Telegram
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {activeSession ? (
              <>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{activeSession.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{activeSession.userName}</div>
                        <div className="text-xs text-muted-foreground">
                          {activeSession.userContact || 'Контакт не указан'}
                        </div>
                      </div>
                    </CardTitle>
                    <div>
                      {activeSession.status === 'active' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => closeSession(activeSession.id)}
                        >
                          Закрыть чат
                        </Button>
                      ) : (
                        <Badge variant="outline">Закрыт</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden flex flex-col">
                  <ScrollArea className="flex-1 h-[400px] pr-4 pb-4">
                    <div className="space-y-3">
                      {activeSession.messages.map(message => (
                        <MessageBubble key={message.id} message={message} isAdmin />
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {activeSession.status === 'active' && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex space-x-2">
                        <Input
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Введите сообщение..."
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                          <Send className="h-4 w-4 mr-2" />
                          Отправить
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Выберите чат</h3>
                  <p className="text-muted-foreground">
                    Выберите чат из списка слева для начала общения
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
