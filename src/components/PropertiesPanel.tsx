'use client';

import React from 'react';
import { MermaidNode, Connection, BoundingBox, DiagramState } from '@/types';
import { Palette, Type, Move, Square } from 'lucide-react';

interface PropertiesPanelProps {
  diagramState: DiagramState;
  onDiagramChange: (state: DiagramState) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  diagramState,
  onDiagramChange,
}) => {
  const selectedNode = diagramState.selectedNode 
    ? diagramState.nodes.find(n => n.id === diagramState.selectedNode)
    : null;

  const selectedConnection = diagramState.selectedConnection
    ? diagramState.connections.find(c => c.id === diagramState.selectedConnection)
    : null;

  const selectedBoundingBox = diagramState.selectedBoundingBox
    ? diagramState.boundingBoxes.find(b => b.id === diagramState.selectedBoundingBox)
    : null;

  const updateNode = (updates: Partial<MermaidNode>) => {
    if (!selectedNode) return;
    
    const updatedNodes = diagramState.nodes.map(node =>
      node.id === selectedNode.id ? { ...node, ...updates } : node
    );
    
    onDiagramChange({
      ...diagramState,
      nodes: updatedNodes,
    });
  };

  const updateConnection = (updates: Partial<Connection>) => {
    if (!selectedConnection) return;
    
    const updatedConnections = diagramState.connections.map(conn =>
      conn.id === selectedConnection.id ? { ...conn, ...updates } : conn
    );
    
    onDiagramChange({
      ...diagramState,
      connections: updatedConnections,
    });
  };

  const updateBoundingBox = (updates: Partial<BoundingBox>) => {
    if (!selectedBoundingBox) return;
    
    const updatedBoxes = diagramState.boundingBoxes.map(box =>
      box.id === selectedBoundingBox.id ? { ...box, ...updates } : box
    );
    
    onDiagramChange({
      ...diagramState,
      boundingBoxes: updatedBoxes,
    });
  };

  if (!selectedNode && !selectedConnection && !selectedBoundingBox) {
    return (
      <div className="w-80 bg-white border-l border-gray-300 p-4">
        <div className="text-center text-gray-500 mt-8">
          <Square className="mx-auto mb-2" size={48} />
          <p>Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-300 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Palette size={20} />
        Properties
      </h3>

      {selectedNode && (
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Type size={16} />
              Node Properties
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={selectedNode.label}
                  onChange={(e) => updateNode({ label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shape
                </label>
                <select
                  value={selectedNode.type}
                  onChange={(e) => updateNode({ type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="rect">Rectangle</option>
                  <option value="circle">Circle</option>
                  <option value="diamond">Diamond</option>
                  <option value="hexagon">Hexagon</option>
                  <option value="stadium">Stadium</option>
                  <option value="subroutine">Subroutine</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedNode.backgroundColor || '#ffffff'}
                    onChange={(e) => updateNode({ backgroundColor: e.target.value })}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedNode.backgroundColor || '#ffffff'}
                    onChange={(e) => updateNode({ backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedNode.textColor || '#000000'}
                    onChange={(e) => updateNode({ textColor: e.target.value })}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedNode.textColor || '#000000'}
                    onChange={(e) => updateNode({ textColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Border Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedNode.borderColor || '#000000'}
                    onChange={(e) => updateNode({ borderColor: e.target.value })}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedNode.borderColor || '#000000'}
                    onChange={(e) => updateNode({ borderColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Border Width
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={selectedNode.borderWidth || 2}
                  onChange={(e) => updateNode({ borderWidth: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">
                  {selectedNode.borderWidth || 2}px
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2 flex items-center gap-2">
              <Move size={16} />
              Position
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">X</label>
                <input
                  type="number"
                  value={Math.round(selectedNode.position.x)}
                  onChange={(e) => updateNode({ 
                    position: { 
                      ...selectedNode.position, 
                      x: parseInt(e.target.value) || 0 
                    } 
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedNode.position.y)}
                  onChange={(e) => updateNode({ 
                    position: { 
                      ...selectedNode.position, 
                      y: parseInt(e.target.value) || 0 
                    } 
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedConnection && (
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h4 className="font-medium mb-2">Connection Properties</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={selectedConnection.label || ''}
                  onChange={(e) => updateConnection({ label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Connection label"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={selectedConnection.type}
                  onChange={(e) => updateConnection({ type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="arrow">Arrow (--&gt;)</option>
                  <option value="line">Line (---)</option>
                  <option value="dotted">Dotted (-.-&gt;)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedConnection.color || '#000000'}
                    onChange={(e) => updateConnection({ color: e.target.value })}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedConnection.color || '#000000'}
                    onChange={(e) => updateConnection({ color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedBoundingBox && (
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h4 className="font-medium mb-2">Bounding Box Properties</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={selectedBoundingBox.label}
                  onChange={(e) => updateBoundingBox({ label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Style
                </label>
                <select
                  value={selectedBoundingBox.style}
                  onChange={(e) => updateBoundingBox({ style: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedBoundingBox.color || '#666666'}
                    onChange={(e) => updateBoundingBox({ color: e.target.value })}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedBoundingBox.color || '#666666'}
                    onChange={(e) => updateBoundingBox({ color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                    placeholder="#666666"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2 flex items-center gap-2">
              <Move size={16} />
              Position & Size
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">X</label>
                <input
                  type="number"
                  value={Math.round(selectedBoundingBox.position.x)}
                  onChange={(e) => updateBoundingBox({ 
                    position: { 
                      ...selectedBoundingBox.position, 
                      x: parseInt(e.target.value) || 0 
                    } 
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedBoundingBox.position.y)}
                  onChange={(e) => updateBoundingBox({ 
                    position: { 
                      ...selectedBoundingBox.position, 
                      y: parseInt(e.target.value) || 0 
                    } 
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Width</label>
                <input
                  type="number"
                  value={Math.round(selectedBoundingBox.size.width)}
                  onChange={(e) => updateBoundingBox({ 
                    size: { 
                      ...selectedBoundingBox.size, 
                      width: parseInt(e.target.value) || 0 
                    } 
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Height</label>
                <input
                  type="number"
                  value={Math.round(selectedBoundingBox.size.height)}
                  onChange={(e) => updateBoundingBox({ 
                    size: { 
                      ...selectedBoundingBox.size, 
                      height: parseInt(e.target.value) || 0 
                    } 
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};