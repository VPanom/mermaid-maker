'use client';

import React, { useState } from 'react';
import { MermaidNode, ToolMode } from '@/types';

interface NodeComponentProps {
  node: MermaidNode;
  isSelected: boolean;
  mode: ToolMode;
  onClick: () => void;
  onLabelChange: (newLabel: string) => void;
  onMove: (newX: number, newY: number) => void;
}

export const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  isSelected,
  mode,
  onClick,
  onLabelChange,
  onMove,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(node.label);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const style = {
    opacity: isDragging ? 0.5 : 1,
    left: node.position.x,
    top: node.position.y,
    backgroundColor: node.backgroundColor || (isSelected ? '#dbeafe' : '#ffffff'),
    color: node.textColor || '#000000',
    borderColor: node.borderColor || (isSelected ? '#3b82f6' : '#9ca3af'),
    borderWidth: node.borderWidth || 2,
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (mode !== 'select') {
      return; // Don't prevent, just don't set drag data
    }
    
    e.dataTransfer.setData('nodeId', node.id);
    e.dataTransfer.setData('existingNode', 'true');
    setIsDragging(true);
    console.log('Moving existing node:', node.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

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
      setEditLabel(node.label);
      setIsEditing(false);
    }
  };

  const getNodeClasses = () => {
    const baseClasses = "absolute cursor-pointer border-solid flex items-center justify-center text-sm font-medium select-none transition-colors";
    
    switch (node.type) {
      case 'rect':
        return `${baseClasses} w-24 h-12 rounded`;
      case 'circle':
        return `${baseClasses} w-16 h-16 rounded-full`;
      case 'diamond':
        return `${baseClasses} w-16 h-16 transform rotate-45`;
      case 'hexagon':
        return `${baseClasses} w-20 h-12 hexagon`;
      case 'stadium':
        return `${baseClasses} w-24 h-12 rounded-full`;
      case 'subroutine':
        return `${baseClasses} w-24 h-12 rounded border-l-4 border-r-4`;
      default:
        return `${baseClasses} w-24 h-12 rounded`;
    }
  };

  return (
    <div
      draggable={mode === 'select'}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={style}
      className={getNodeClasses()}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          type="text"
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onBlur={handleLabelSubmit}
          onKeyDown={handleKeyPress}
          onMouseDown={(e) => e.stopPropagation()}
          onDragStart={(e) => e.preventDefault()}
          className="w-full text-center bg-transparent border-none outline-none text-xs"
          autoFocus
        />
      ) : (
        <span
          className={`text-center text-xs px-1 ${
            node.type === 'diamond' ? 'transform -rotate-45' : ''
          }`}
        >
          {node.label}
        </span>
      )}
    </div>
  );
};