'use client';

import React, { useState } from 'react';

interface Node {
  id: string;
  type: string;
  x: number;
  y: number;
}

export default function TestPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [draggedType, setDraggedType] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    setDraggedType(nodeType);
    console.log('Drag start:', nodeType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedType) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNode: Node = {
      id: `node_${nodes.length + 1}`,
      type: draggedType,
      x: x - 25,
      y: y - 25,
    };

    console.log('Drop:', newNode);
    setNodes([...nodes, newNode]);
    setDraggedType(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Palette */}
      <div className="w-48 bg-white border-r p-4">
        <h3 className="font-bold mb-4">Drag Test</h3>
        <div className="space-y-2">
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, 'rect')}
            className="p-2 bg-blue-200 border cursor-grab"
          >
            Rectangle
          </div>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, 'circle')}
            className="p-2 bg-green-200 border cursor-grab"
          >
            Circle
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-300 relative"
        >
          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute w-12 h-12 bg-blue-500 border rounded flex items-center justify-center text-white text-xs"
              style={{ left: node.x, top: node.y }}
            >
              {node.type}
            </div>
          ))}
          {nodes.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500">
              Drag items here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}