'use client';

import React from 'react';
import { ToolMode } from '@/types';
import { MousePointer2, Move3D, Square, ArrowUpRight, Trash2, Undo, Redo } from 'lucide-react';

interface ToolbarProps {
  mode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  hasSelection: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  mode, 
  onModeChange, 
  onDelete, 
  onUndo, 
  onRedo, 
  hasSelection, 
  canUndo, 
  canRedo 
}) => {
  const tools = [
    { id: 'select' as ToolMode, icon: MousePointer2, label: 'Select' },
    { id: 'connect' as ToolMode, icon: ArrowUpRight, label: 'Connect' },
    { id: 'boundingBox' as ToolMode, icon: Square, label: 'Bounding Box' },
  ];

  return (
    <div className="flex items-center gap-2 p-2 bg-white border-b border-gray-200">
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onModeChange(tool.id)}
              className={`p-2 rounded text-sm flex items-center gap-1 transition-colors ${
                mode === tool.id
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200 text-gray-700'
              }`}
              title={tool.label}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tool.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Undo/Redo buttons */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded ml-4">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-2 rounded text-sm flex items-center gap-1 transition-colors ${
            canUndo
              ? 'hover:bg-gray-200 text-gray-700'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={16} />
          <span className="hidden sm:inline">Undo</span>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-2 rounded text-sm flex items-center gap-1 transition-colors ${
            canRedo
              ? 'hover:bg-gray-200 text-gray-700'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={16} />
          <span className="hidden sm:inline">Redo</span>
        </button>
      </div>
      
      {/* Delete button */}
      <button
        onClick={onDelete}
        disabled={!hasSelection}
        className={`p-2 rounded text-sm flex items-center gap-1 transition-colors ml-2 ${
          hasSelection
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        title="Delete selected item"
      >
        <Trash2 size={16} />
        <span className="hidden sm:inline">Delete</span>
      </button>
      
      <div className="text-sm text-gray-600 ml-4">
        {mode === 'select' && 'Click to select, drag to move'}
        {mode === 'connect' && 'Click nodes to connect them'}
        {mode === 'boundingBox' && 'Draw boxes to group elements • Boxes inside other boxes will be nested'}
        {hasSelection && ' | Press Delete key or click trash to delete selected item'}
      </div>
    </div>
  );
};