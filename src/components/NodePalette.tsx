'use client';

import React from 'react';
import { NodeType } from '@/types';

interface PaletteNodeProps {
  type: NodeType;
  label: string;
}

const PaletteNode: React.FC<PaletteNodeProps> = ({ type, label }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('nodeType', type);
    console.log('Starting palette drag for:', type);
  };

  const getNodeClasses = () => {
    const baseClasses = "cursor-grab border-2 border-gray-400 bg-white hover:border-gray-600 flex items-center justify-center text-xs font-medium select-none mb-2";
    
    switch (type) {
      case 'rect':
        return `${baseClasses} w-20 h-10 rounded`;
      case 'circle':
        return `${baseClasses} w-12 h-12 rounded-full`;
      case 'diamond':
        return `${baseClasses} w-12 h-12 transform rotate-45`;
      case 'hexagon':
        return `${baseClasses} w-16 h-10 hexagon`;
      case 'stadium':
        return `${baseClasses} w-20 h-10 rounded-full`;
      case 'subroutine':
        return `${baseClasses} w-20 h-10 rounded border-l-4 border-r-4`;
      default:
        return `${baseClasses} w-20 h-10 rounded`;
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={getNodeClasses()}
    >
      <span className={`text-center ${type === 'diamond' ? 'transform -rotate-45' : ''}`}>
        {label}
      </span>
    </div>
  );
};

export const NodePalette: React.FC = () => {
  const nodeTypes: { type: NodeType; label: string }[] = [
    { type: 'rect', label: 'Rectangle' },
    { type: 'circle', label: 'Circle' },
    { type: 'diamond', label: 'Diamond' },
    { type: 'hexagon', label: 'Hexagon' },
    { type: 'stadium', label: 'Stadium' },
    { type: 'subroutine', label: 'Subroutine' },
  ];

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-300 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Node Palette</h3>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Flowchart Nodes</h4>
        {nodeTypes.map((nodeType) => (
          <PaletteNode
            key={nodeType.type}
            type={nodeType.type}
            label={nodeType.label}
          />
        ))}
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Instructions</h4>
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Drag nodes onto the canvas</p>
          <p>• Click to select nodes</p>
          <p>• Double-click to edit labels</p>
          <p>• Drag existing nodes to move them</p>
        </div>
      </div>
    </div>
  );
};