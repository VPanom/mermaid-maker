'use client';

import React, { useState } from 'react';
import { BoundingBox } from '@/types';

interface BoundingBoxProps {
  boundingBox: BoundingBox;
  isSelected: boolean;
  isNested?: boolean;
  onClick: () => void;
  onLabelChange: (newLabel: string) => void;
  onMove: (newX: number, newY: number) => void;
  onResize: (newWidth: number, newHeight: number) => void;
}

export const BoundingBoxComponent: React.FC<BoundingBoxProps> = ({
  boundingBox,
  isSelected,
  isNested = !!boundingBox.parentId,
  onClick,
  onLabelChange,
  onMove,
  onResize,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(boundingBox.label);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleLabelSubmit = () => {
    onLabelChange(editLabel);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSubmit();
    }
    if (e.key === 'Escape') {
      setEditLabel(boundingBox.label);
      setIsEditing(false);
    }
  };

  const getBorderStyle = () => {
    switch (boundingBox.style) {
      case 'dashed':
        return 'border-dashed';
      case 'dotted':
        return 'border-dotted';
      default:
        return 'border-solid';
    }
  };

  const style = {
    left: boundingBox.position.x,
    top: boundingBox.position.y,
    width: boundingBox.size.width,
    height: boundingBox.size.height,
    borderColor: boundingBox.color,
  };

  return (
    <div
      className={`absolute border-2 ${getBorderStyle()} bg-transparent pointer-events-auto ${
        isSelected ? 'border-blue-500 bg-blue-50 bg-opacity-10' : 'hover:bg-gray-50 hover:bg-opacity-20'
      } ${isNested ? 'border-dashed' : 'border-solid'}`}
      style={{
        ...style,
        zIndex: boundingBox.zIndex,
        backgroundColor: isNested 
          ? (isSelected ? 'rgba(59, 130, 246, 0.05)' : 'rgba(74, 144, 226, 0.02)') 
          : isSelected 
          ? 'rgba(59, 130, 246, 0.1)' 
          : 'transparent'
      }}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Label */}
      <div className="absolute -top-6 left-0 bg-white px-1 text-xs border rounded">
        {isEditing ? (
          <input
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={handleLabelSubmit}
            onKeyDown={handleKeyPress}
            className="w-full bg-transparent border-none outline-none text-xs"
            autoFocus
          />
        ) : (
          <span>{boundingBox.label}</span>
        )}
      </div>

      {/* Resize handles */}
      {isSelected && (
        <>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 cursor-se-resize"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 cursor-ne-resize"></div>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 cursor-nw-resize"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 cursor-sw-resize"></div>
        </>
      )}
    </div>
  );
};