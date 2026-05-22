// components/ChatSidebar.tsx
import React from 'react';
import { Pin, Trash2, Plus, MessageSquare, Shield, X } from 'lucide-react';
import { ChatSession } from '@/hooks/useChatHistory';

interface ChatSidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  isPrivateMode: boolean;
  isOpen: boolean;
  showDesktop: boolean;
  onClose: () => void;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onTogglePinChat: (id: string) => void;
  onClearAllChats: () => void;
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // Reset time part of dates to check calendar day difference
  const dateZeroTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowZeroTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = nowZeroTime.getTime() - dateZeroTime.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export default function ChatSidebar({
  chats,
  activeChatId,
  isPrivateMode,
  isOpen,
  showDesktop,
  onClose,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onTogglePinChat,
  onClearAllChats,
}: ChatSidebarProps) {
  // Sort chats: Pinned first, then by updatedAt desc
  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const handleClearAll = () => {
    const confirmMsg = isPrivateMode 
      ? 'Are you sure you want to clear all private chats for this session?' 
      : 'Are you sure you want to clear all your chat history? This cannot be undone.';
    if (window.confirm(confirmMsg)) {
      onClearAllChats();
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 border-r border-zinc-800/80">
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent tracking-wide">
            AroxAI
          </span>
          {isPrivateMode && (
            <span className="flex items-center gap-1 text-[10px] bg-purple-950/80 text-purple-400 border border-purple-800/50 px-2 py-0.5 rounded-full font-semibold animate-pulse">
              <Shield className="w-3 h-3" /> Incognito
            </span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-1 md:hidden hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-blue-500/50 transition-all duration-300 group shadow-[0_0_15px_rgba(0,0,0,0.2)]"
        >
          <Plus className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
          <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
            New Chat
          </span>
        </button>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1.5 py-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {sortedChats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-4 text-center mt-10">
            <MessageSquare className="w-8 h-8 mb-2 opacity-30 text-zinc-400" />
            <p className="text-xs">No chats yet</p>
            {isPrivateMode && (
              <p className="text-[10px] text-zinc-600 mt-1">Chats won't be saved to disk</p>
            )}
          </div>
        ) : (
          sortedChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <div
                key={chat.id}
                className={`group relative flex items-center justify-between rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/10 border border-blue-500/20 text-white shadow-[0_0_10px_rgba(59,130,246,0.05)]'
                    : 'border border-transparent hover:bg-zinc-900/60 text-zinc-300 hover:text-zinc-100'
                }`}
                onClick={() => {
                  onSelectChat(chat.id);
                  onClose();
                }}
              >
                {/* Chat title and timestamp */}
                <div className="flex-1 min-w-0 pr-10">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {chat.isPinned && (
                      <Pin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 rotate-45 fill-blue-400" />
                    )}
                    <p className="text-sm font-medium truncate">
                      {chat.title}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {formatTime(chat.updatedAt)}
                  </span>
                </div>

                {/* Hover actions */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-zinc-950 group-hover:from-zinc-900/90 pl-4 py-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePinChat(chat.id);
                    }}
                    className={`p-1.5 rounded-lg hover:bg-zinc-800 transition-colors ${
                      chat.isPinned ? 'text-blue-400' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title={chat.isPinned ? 'Unpin chat' : 'Pin chat'}
                  >
                    <Pin className={`w-3.5 h-3.5 ${chat.isPinned ? 'rotate-45 fill-blue-400' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      {chats.length > 0 && (
        <div className="p-4 border-t border-zinc-800/60 bg-zinc-950/80">
          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-950/30 bg-red-950/10 hover:bg-red-900/20 text-red-400 hover:text-red-300 transition-all duration-300 text-xs font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            Delete all chats
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <div 
        className={`fixed top-0 bottom-0 left-0 w-72 z-50 md:hidden transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop Sidebar — only visible when showDesktop is true */}
      {showDesktop && (
        <div className="hidden md:block w-72 flex-shrink-0 h-screen overflow-hidden">
          <SidebarContent />
        </div>
      )}
    </>
  );
}
