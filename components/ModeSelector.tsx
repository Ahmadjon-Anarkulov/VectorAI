import React from 'react';
import { ChevronDown, Shield } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const ModeSelector = ({ 
  isstreetMode, 
  setisstreetMode,
  isPrivateMode,
  setIsPrivateMode
}: { 
  isstreetMode: boolean;
  setisstreetMode: (value: boolean) => void;
  isPrivateMode: boolean;
  setIsPrivateMode: (value: boolean) => void;
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-black dark:text-white font-semibold outline-none ">
          Arox {isstreetMode ? 'Street' : ''}
          {isPrivateMode && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 rounded-md font-bold">
              <Shield className="w-3 h-3" /> Incognito
            </span>
          )}
          <span className="px-2 py-0.5 text-xs bg-sky-100 dark:bg-blue-950/70 text-sky-500 dark:text-blue-500 rounded-md font-bold">
            beta
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[220px] bg-popover rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] p-1 animate-in data-[side=bottom]:slide-in-from-top-2 z-[100]"
          sideOffset={5}
        >
          <DropdownMenu.Item
            className="relative flex items-center justify-between px-4 py-3 cursor-pointer outline-none"
            onSelect={(event) => {
              event.preventDefault();
              setisstreetMode(!isstreetMode);
            }}
          >
            <span className="font-medium text-black dark:text-white">Street Mode</span>
            <div className={`w-9 h-5 rounded-full transition-colors ${
              isstreetMode ? 'bg-sky-500 dark:bg-blue-500' : 'bg-input'
            } relative`}>
              <div className={`absolute w-4 h-4 rounded-full bg-white transform transition-transform top-0.5 left-0.5 ${
                isstreetMode ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="relative flex items-center justify-between px-4 py-3 cursor-pointer outline-none border-t border-zinc-800/40"
            onSelect={(event) => {
              event.preventDefault();
              setIsPrivateMode(!isPrivateMode);
            }}
          >
            <span className="font-medium text-black dark:text-white flex items-center gap-1">
              Private Mode
            </span>
            <div className={`w-9 h-5 rounded-full transition-colors ${
              isPrivateMode ? 'bg-purple-500 dark:bg-purple-600' : 'bg-input'
            } relative`}>
              <div className={`absolute w-4 h-4 rounded-full bg-white transform transition-transform top-0.5 left-0.5 ${
                isPrivateMode ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ModeSelector;