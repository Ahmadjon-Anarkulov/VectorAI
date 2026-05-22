// hooks/useChatHistory.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/types/chat';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
}

const LOCAL_STORAGE_KEY = 'aroxai_chats';

const getTitleFromFirstMessage = (messages: Message[]): string => {
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (!firstUserMsg) return 'New Chat';
  
  let text = '';
  if (typeof firstUserMsg.content === 'string') {
    text = firstUserMsg.content;
  } else {
    text = firstUserMsg.content.text;
  }
  
  try {
    const parsed = JSON.parse(text);
    if (parsed.type === 'image') {
      text = parsed.prompt || 'Image Chat';
    }
  } catch {}
  
  const cleanText = text.trim();
  if (cleanText.length > 35) {
    return cleanText.substring(0, 32) + '...';
  }
  return cleanText || 'New Chat';
};

export function useChatHistory() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [privateChats, setPrivateChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isPrivateMode, setIsPrivateMode] = useState<boolean>(false);

  const isPrivateModeRef = useRef(isPrivateMode);
  useEffect(() => {
    isPrivateModeRef.current = isPrivateMode;
  }, [isPrivateMode]);

  // Load chats from localStorage on mount (only normal chats)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setChats(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load chats from localStorage:', e);
    }
  }, []);

  // Sync normal chats to localStorage when they change
  useEffect(() => {
    if (!isPrivateMode) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chats));
      } catch (e) {
        console.error('Failed to save chats to localStorage:', e);
      }
    }
  }, [chats, isPrivateMode]);

  const currentChatsList = isPrivateMode ? privateChats : chats;

  // Set the correct list depending on mode
  const updateChatsList = useCallback((updater: (prev: ChatSession[]) => ChatSession[]) => {
    if (isPrivateModeRef.current) {
      setPrivateChats(prev => updater(prev));
    } else {
      setChats(prev => updater(prev));
    }
  }, []);

  // Create a new chat session or update an existing one when messages change
  const saveMessageUpdate = useCallback((messages: Message[], currentActiveId: string | null): string => {
    if (messages.length === 0) return '';

    const list = isPrivateMode ? privateChats : chats;
    const existingChat = currentActiveId ? list.find(c => c.id === currentActiveId) : null;

    if (existingChat) {
      // Update existing session
      updateChatsList(prev => 
        prev.map(c => 
          c.id === currentActiveId 
            ? { ...c, messages, updatedAt: Date.now(), title: c.title === 'New Chat' ? getTitleFromFirstMessage(messages) : c.title } 
            : c
        )
      );
      return existingChat.id;
    } else {
      // Create new session
      const newId = Date.now().toString();
      const newSession: ChatSession = {
        id: newId,
        title: getTitleFromFirstMessage(messages),
        messages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false
      };
      updateChatsList(prev => [newSession, ...prev]);
      setActiveChatId(newId);
      return newId;
    }
  }, [chats, privateChats, isPrivateMode, updateChatsList]);

  const createNewChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

  const selectChat = useCallback((id: string, setMessages: (msgs: Message[]) => void) => {
    const list = isPrivateModeRef.current ? privateChats : chats;
    const chat = list.find(c => c.id === id);
    if (chat) {
      setActiveChatId(id);
      setMessages(chat.messages);
    }
  }, [chats, privateChats, isPrivateMode]);

  const deleteChat = useCallback((id: string) => {
    updateChatsList(prev => prev.filter(c => c.id !== id));
    setActiveChatId(prev => (prev === id ? null : prev));
  }, [updateChatsList]);

  const togglePinChat = useCallback((id: string) => {
    updateChatsList(prev => 
      prev.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c)
    );
  }, [updateChatsList]);

  const clearAllChats = useCallback(() => {
    updateChatsList(() => []);
    setActiveChatId(null);
  }, [updateChatsList]);

  // Handle switching private mode
  const handleTogglePrivateMode = useCallback((val: boolean) => {
    setIsPrivateMode(val);
    setActiveChatId(null);
    if (!val) {
      // Clear temporary private chats when leaving private mode
      setPrivateChats([]);
    }
  }, []);

  return {
    chats: currentChatsList,
    activeChatId,
    isPrivateMode,
    setIsPrivateMode: handleTogglePrivateMode,
    createNewChat,
    selectChat,
    deleteChat,
    togglePinChat,
    clearAllChats,
    saveMessageUpdate
  };
}
