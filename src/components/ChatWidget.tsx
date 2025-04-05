
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChatMessage } from '@/types/chat';
import { MessageCircle, X, Minimize2, Maximize2, Send, PaperclipIcon, UserCircle, Phone } from 'lucide-react';

const ChatWidget: React.FC = () => {
  const { 
    chatState, 
    isOpen, 
    openChat, 
    closeChat, 
    toggleChat,
    minimizeChat,
    maximizeChat,
    sendMessage,
    submitPhoneNumber
  } = useChat();
  const [messageText, setMessageText] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const messageInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { sessions, activeSessionId, isMinimized } = chatState;
  const activeSession = sessions.find(session => session.id === activeSessionId);
  const isAwaitingPhoneNumber = activeSession?.awaitingPhoneNumber;
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages, isOpen, isMinimized]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      if (isAwaitingPhoneNumber && phoneInputRef.current) {
        phoneInputRef.current.focus();
      } else if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  }, [isOpen, isMinimized, activeSessionId, isAwaitingPhoneNumber]);
  
  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText('');
    }
  };
  
  const handleSubmitPhoneNumber = () => {
    if (phoneNumber.trim() && phoneNumber.length > 5) {
      submitPhoneNumber(phoneNumber);
      setPhoneNumber('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, action: 'message' | 'phone') => {
    if (e.key === 'Enter') {
      if (action === 'message') {
        handleSendMessage();
      } else {
        handleSubmitPhoneNumber();
      }
    }
  };
  
  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={openChat} 
              className="rounded-full p-4 h-14 w-14 fixed bottom-6 right-6 shadow-lg z-50"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Чат с консультантом</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-200 border ${isMinimized ? 'w-72 h-14' : 'w-80 sm:w-96 h-[500px]'}`}>
      {/* Chat header */}
      <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
        <div className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Чат с консультантом</h3>
        </div>
        <div className="flex items-center space-x-2">
          {isMinimized ? (
            <Button variant="ghost" size="icon" onClick={maximizeChat} className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary/90">
              <Maximize2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={minimizeChat} className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary/90">
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={closeChat} className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary/90">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Chat messages */}
          <ScrollArea className="h-[400px] p-3">
            {activeSession ? (
              activeSession.messages.length > 0 ? (
                <div className="flex flex-col space-y-3">
                  {activeSession.messages.map((message: ChatMessage) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Начните диалог с нашим консультантом</p>
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Не удалось загрузить чат</p>
              </div>
            )}
          </ScrollArea>
          
          {/* Chat input */}
          <div className="p-3 border-t">
            {isAwaitingPhoneNumber ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Введите ваш номер телефона:</p>
                <div className="flex space-x-2">
                  <Input
                    ref={phoneInputRef}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'phone')}
                    placeholder="+7 (999) 123-45-67"
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleSubmitPhoneNumber} disabled={!phoneNumber.trim() || phoneNumber.length < 5}>
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Input
                  ref={messageInputRef}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'message')}
                  placeholder="Введите сообщение..."
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSendMessage} disabled={!messageText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUserMessage = message.senderType === 'user';
  
  const getMessageStyle = () => {
    switch (message.senderType) {
      case 'user':
        return 'bg-primary text-primary-foreground ml-auto';
      case 'admin':
        return 'bg-secondary text-secondary-foreground';
      case 'system':
        return 'bg-muted text-muted-foreground w-full text-center';
      case 'telegram':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };
  
  return (
    <div className={`flex items-start ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
      {!isUserMessage && message.senderType !== 'system' && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarFallback>
            {message.senderType === 'admin' ? 'A' : message.senderType === 'telegram' ? 'T' : 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`rounded-lg px-3 py-2 max-w-[75%] ${getMessageStyle()}`}>
        {message.senderType !== 'user' && message.senderType !== 'system' && (
          <div className="text-xs font-medium opacity-75 mb-1">{message.senderName}</div>
        )}
        <div className="break-words">{message.content}</div>
        <div className="text-xs opacity-75 mt-1 text-right">
          {format(new Date(message.timestamp), 'HH:mm', { locale: ru })}
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
