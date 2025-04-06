
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession, ChatMessage, ChatState } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/contexts/AdminContext';
import { useLocation } from 'react-router-dom';

interface ChatContextType {
  chatState: ChatState;
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
  sendMessage: (content: string, attachments?: any[]) => void;
  setActiveSession: (sessionId: string) => void;
  startNewSession: (userName?: string, userContact?: string) => void;
  closeSession: (sessionId: string) => void;
  submitPhoneNumber: (phone: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState>({
    sessions: [],
    activeSessionId: null,
    isMinimized: false
  });
  const [responseTimeoutId, setResponseTimeoutId] = useState<number | null>(null);
  const [hasRequestedContact, setHasRequestedContact] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAdmin();
  const location = useLocation();

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        setChatState(prevState => ({
          ...prevState,
          sessions: parsedSessions
        }));
      } catch (error) {
        console.error('Failed to parse saved chat sessions:', error);
      }
    }
  }, []);

  // Save chat sessions to localStorage when they change
  useEffect(() => {
    localStorage.setItem('chatSessions', JSON.stringify(chatState.sessions));
  }, [chatState.sessions]);

  // Don't show chat widget on admin pages
  useEffect(() => {
    if (isAdmin && isOpen && location.pathname.startsWith('/admin')) {
      setIsOpen(false);
    }
  }, [isAdmin, isOpen, location]);

  // Add a system message to welcome the user when they start a new session
  const addSystemMessage = (sessionId: string, content: string = 'Здравствуйте! Чем мы можем вам помочь?') => {
    const systemMessage: ChatMessage = {
      id: uuidv4(),
      senderId: 'system',
      senderName: 'Система',
      senderType: 'system',
      content,
      timestamp: new Date().toISOString(),
      isRead: true
    };

    setChatState(prevState => ({
      ...prevState,
      sessions: prevState.sessions.map(session => 
        session.id === sessionId 
          ? { ...session, messages: [...session.messages, systemMessage] }
          : session
      )
    }));
  };

  const openChat = () => {
    // Don't open chat on admin pages
    if (isAdmin && location.pathname.startsWith('/admin')) {
      return;
    }

    setIsOpen(true);
    setChatState(prev => ({ ...prev, isMinimized: false }));
    setHasRequestedContact(false);
    
    // If there's no active session, start a new one
    if (!chatState.activeSessionId && chatState.sessions.length === 0) {
      startNewSession();
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    
    // Clear any pending response timeouts
    if (responseTimeoutId) {
      clearTimeout(responseTimeoutId);
      setResponseTimeoutId(null);
    }
  };

  const toggleChat = () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  const minimizeChat = () => {
    setChatState(prev => ({ ...prev, isMinimized: true }));
  };

  const maximizeChat = () => {
    setChatState(prev => ({ ...prev, isMinimized: false }));
  };

  const requestPhoneNumber = (sessionId: string) => {
    if (hasRequestedContact) return;
    
    const systemMessage: ChatMessage = {
      id: uuidv4(),
      senderId: 'system',
      senderName: 'Система',
      senderType: 'system',
      content: 'Кажется, наши менеджеры сейчас заняты. Пожалуйста, оставьте свой номер телефона, и мы свяжемся с вами в ближайшее время или оставьте заявку на консультацию.',
      timestamp: new Date().toISOString(),
      isRead: true
    };
    
    setChatState(prevState => ({
      ...prevState,
      sessions: prevState.sessions.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              messages: [...session.messages, systemMessage],
              awaitingPhoneNumber: true
            }
          : session
      )
    }));
    
    setHasRequestedContact(true);
  };

  const submitPhoneNumber = (phone: string) => {
    if (!chatState.activeSessionId) return;
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      senderId: 'user',
      senderName: 'Вы',
      senderType: 'user',
      content: `Мой номер телефона: ${phone}`,
      timestamp: new Date().toISOString(),
      isRead: true
    };
    
    const confirmationMessage: ChatMessage = {
      id: uuidv4(),
      senderId: 'system',
      senderName: 'Система',
      senderType: 'system',
      content: 'Спасибо! Мы получили ваш номер телефона и свяжемся с вами в ближайшее время.',
      timestamp: new Date().toISOString(),
      isRead: true
    };
    
    setChatState(prevState => ({
      ...prevState,
      sessions: prevState.sessions.map(session => 
        session.id === prevState.activeSessionId 
          ? { 
              ...session, 
              messages: [...session.messages, userMessage, confirmationMessage],
              userContact: phone,
              awaitingPhoneNumber: false
            }
          : session
      )
    }));
    
    // Clear any pending response timeouts
    if (responseTimeoutId) {
      clearTimeout(responseTimeoutId);
      setResponseTimeoutId(null);
    }
  };

  const sendMessage = (content: string, attachments: any[] = []) => {
    if (!content.trim() && attachments.length === 0) return;
    
    // If there's no active session, create one
    if (!chatState.activeSessionId) {
      startNewSession();
      return;
    }
    
    const message: ChatMessage = {
      id: uuidv4(),
      senderId: 'user',
      senderName: 'Вы',
      senderType: 'user',
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      attachments: attachments.map(att => ({
        id: uuidv4(),
        ...att
      }))
    };
    
    // Clear any pending response timeouts
    if (responseTimeoutId) {
      clearTimeout(responseTimeoutId);
      setResponseTimeoutId(null);
    }
    
    setChatState(prevState => {
      const activeSession = prevState.sessions.find(session => session.id === prevState.activeSessionId);
      const isPhoneNumberSubmission = activeSession?.awaitingPhoneNumber && 
        content.match(/\+?\d[\d\s-]{8,}/); // Simple phone number regex
      
      if (isPhoneNumberSubmission) {
        // If this is a phone number submission, handle it differently
        return {
          ...prevState,
          sessions: prevState.sessions.map(session => 
            session.id === prevState.activeSessionId 
              ? { 
                  ...session, 
                  messages: [...session.messages, message],
                  userContact: content,
                  awaitingPhoneNumber: false,
                  lastActivity: new Date().toISOString()
                }
              : session
          )
        };
      }
      
      const updatedSessions = prevState.sessions.map(session => 
        session.id === prevState.activeSessionId 
          ? { 
              ...session, 
              messages: [...session.messages, message],
              lastActivity: new Date().toISOString()
            }
          : session
      );
      
      return {
        ...prevState,
        sessions: updatedSessions
      };
    });
    
    // Set a timeout for the system to request a phone number if no response
    const timeoutId = window.setTimeout(() => {
      if (chatState.activeSessionId) {
        requestPhoneNumber(chatState.activeSessionId);
      }
    }, 10000); // 10 seconds
    
    setResponseTimeoutId(timeoutId);
    
    // Simulate a response from the admin after a delay
    setTimeout(() => {
      simulateAdminResponse(content);
    }, 1000);
  };

  const simulateAdminResponse = (userMessage: string) => {
    // Only respond if there's an active session
    if (!chatState.activeSessionId) return;
    
    // Clear any pending response timeouts
    if (responseTimeoutId) {
      clearTimeout(responseTimeoutId);
      setResponseTimeoutId(null);
    }
    
    let responseContent = 'Спасибо за ваше сообщение! Наш специалист ответит вам в ближайшее время.';
    
    // Some basic responses based on keywords
    if (userMessage.toLowerCase().includes('цена') || userMessage.toLowerCase().includes('стоимость')) {
      responseContent = 'Цены на наши автомобили начинаются от 1 200 000 рублей. Для получения более подробной информации, пожалуйста, уточните модель автомобиля, которая вас интересует.';
    } else if (userMessage.toLowerCase().includes('тест-драйв')) {
      responseContent = 'Вы можете записаться на тест-драйв, позвонив по телефону +7 (999) 123-45-67 или оставив заявку на нашем сайте. Мы свяжемся с вами для согласования даты и времени.';
    } else if (userMessage.toLowerCase().includes('кредит')) {
      responseContent = 'Мы предлагаем выгодные кредитные программы от наших банков-партнеров. Первоначальный взнос от 10%, ставка от 5.9% годовых. Для расчета кредита, пожалуйста, свяжитесь с нашими консультантами.';
    }
    
    const adminMessage: ChatMessage = {
      id: uuidv4(),
      senderId: 'admin',
      senderName: 'Менеджер',
      senderType: 'admin',
      content: responseContent,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setChatState(prevState => ({
      ...prevState,
      sessions: prevState.sessions.map(session => 
        session.id === prevState.activeSessionId 
          ? { 
              ...session, 
              messages: [...session.messages, adminMessage],
              lastActivity: new Date().toISOString(),
              unreadCount: session.unreadCount + 1
            }
          : session
      )
    }));
    
    // Show notification if chat is minimized
    if (chatState.isMinimized || !isOpen) {
      toast({
        title: "Новое сообщение",
        description: "Вы получили новое сообщение от менеджера"
      });
    }
  };

  const setActiveSession = (sessionId: string) => {
    setChatState(prevState => ({
      ...prevState,
      activeSessionId: sessionId,
      sessions: prevState.sessions.map(session => 
        session.id === sessionId 
          ? { ...session, unreadCount: 0 } // Mark all messages as read
          : session
      )
    }));
  };

  const startNewSession = (userName = 'Гость', userContact = '') => {
    const sessionId = uuidv4();
    const newSession: ChatSession = {
      id: sessionId,
      userName,
      userContact,
      status: 'active',
      lastActivity: new Date().toISOString(),
      unreadCount: 0,
      messages: [],
      awaitingPhoneNumber: false
    };
    
    setChatState(prevState => ({
      ...prevState,
      activeSessionId: sessionId,
      sessions: [...prevState.sessions, newSession]
    }));
    
    // Add welcome message
    setTimeout(() => {
      addSystemMessage(sessionId);
    }, 300);
  };

  const closeSession = (sessionId: string) => {
    setChatState(prevState => {
      const updatedSessions = prevState.sessions.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'closed' as const }
          : session
      );
      
      // If the closed session was active, set another session as active
      let newActiveSessionId = prevState.activeSessionId;
      if (prevState.activeSessionId === sessionId) {
        const activeSession = updatedSessions.find(s => s.status === 'active');
        newActiveSessionId = activeSession ? activeSession.id : null;
      }
      
      return {
        ...prevState,
        activeSessionId: newActiveSessionId,
        sessions: updatedSessions
      };
    });
  };

  return (
    <ChatContext.Provider
      value={{
        chatState,
        isOpen,
        openChat,
        closeChat,
        toggleChat,
        minimizeChat,
        maximizeChat,
        sendMessage,
        setActiveSession,
        startNewSession,
        closeSession,
        submitPhoneNumber
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
