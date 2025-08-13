'use client';

import React, { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  submenu?: ContextMenuItem[];
  separator?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  items,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    
    if (item.submenu) {
      setOpenSubmenu(openSubmenu === item.id ? null : item.id);
    } else {
      item.onClick?.();
      onClose();
    }
  };

  if (!isOpen) return null;

  // Adjust position to keep menu within viewport
  const adjustedPosition = { ...position };
  if (menuRef.current) {
    const rect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (position.x + rect.width > viewportWidth) {
      adjustedPosition.x = viewportWidth - rect.width - 10;
    }
    if (position.y + rect.height > viewportHeight) {
      adjustedPosition.y = viewportHeight - rect.height - 10;
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg py-1 z-50 min-w-48"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, index) => (
        <div key={item.id || index}>
          {item.separator ? (
            <div className="my-1 border-t border-gray-200" />
          ) : (
            <div
              className={`relative px-3 py-2 flex items-center gap-2 text-sm cursor-pointer transition-colors ${
                item.disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => item.submenu && setOpenSubmenu(item.id)}
            >
              {item.icon && (
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  {item.icon}
                </span>
              )}
              <span className="flex-1">{item.label}</span>
              {item.submenu && (
                <ChevronRight size={14} className="flex-shrink-0" />
              )}
              
              {/* Submenu */}
              {item.submenu && openSubmenu === item.id && (
                <div
                  className="absolute left-full top-0 ml-1 bg-white border border-gray-300 rounded-lg shadow-lg py-1 min-w-40"
                  style={{ zIndex: 51 }}
                >
                  {item.submenu.map((subItem, subIndex) => (
                    <div
                      key={subItem.id || subIndex}
                      className={`px-3 py-2 flex items-center gap-2 text-sm cursor-pointer transition-colors ${
                        subItem.disabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        if (!subItem.disabled) {
                          subItem.onClick?.();
                          onClose();
                        }
                      }}
                    >
                      {subItem.icon && (
                        <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                          {subItem.icon}
                        </span>
                      )}
                      <span>{subItem.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};