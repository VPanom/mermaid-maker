'use client';

import React, { useRef, useState } from 'react';
import { DiagramState, MermaidNode, NodeType, Connection, BoundingBox } from '@/types';
import { NodeComponent } from './NodeComponent';
import { ConnectionLayer } from './ConnectionLayer';
import { BoundingBoxComponent } from './BoundingBoxComponent';
import { ContextMenuItem } from './ContextMenu';
import { 
  Clipboard, 
  Trash2, 
  Square, 
  Circle, 
  Diamond, 
  Copy, 
  MousePointer, 
  X 
} from 'lucide-react';

interface CanvasProps {
  diagramState: DiagramState;
  onDiagramChange: (state: DiagramState) => void;
  onShowContextMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  hasClipboard: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  diagramState, 
  onDiagramChange, 
  onShowContextMenu, 
  onCopy, 
  onPaste, 
  onDelete, 
  hasClipboard 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeIdCounter = useRef(0);
  const connectionIdCounter = useRef(0);
  const boundingBoxIdCounter = useRef(0);
  
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isDrawingBoundingBox, setIsDrawingBoundingBox] = useState(false);
  const [boundingBoxStart, setBoundingBoxStart] = useState<{ x: number; y: number } | null>(null);

  const createNode = (type: NodeType, x: number, y: number): MermaidNode => {
    nodeIdCounter.current += 1;
    return {
      id: `node_${nodeIdCounter.current}`,
      type,
      position: { x, y },
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodeIdCounter.current}`,
      connections: [],
    };
  };

  const createConnection = (fromId: string, toId: string): Connection => {
    connectionIdCounter.current += 1;
    return {
      id: `connection_${connectionIdCounter.current}`,
      from: fromId,
      to: toId,
      type: 'arrow',
      label: '',
    };
  };

  const createBoundingBox = (x: number, y: number, width: number, height: number): BoundingBox => {
    boundingBoxIdCounter.current += 1;
    
    // Find if this new box is being created inside an existing box
    const parentBox = diagramState.boundingBoxes.find(box => {
      return x > box.position.x && 
             y > box.position.y && 
             x + width < box.position.x + box.size.width && 
             y + height < box.position.y + box.size.height;
    });

    // Calculate zIndex - nested boxes should be on top
    const maxZIndex = Math.max(0, ...diagramState.boundingBoxes.map(box => box.zIndex || 0));
    const zIndex = parentBox ? (parentBox.zIndex || 0) + 1 : maxZIndex + 1;

    return {
      id: `box_${boundingBoxIdCounter.current}`,
      position: { x, y },
      size: { width, height },
      label: parentBox ? `Sub-Group ${boundingBoxIdCounter.current}` : `Group ${boundingBoxIdCounter.current}`,
      style: 'solid',
      color: parentBox ? '#4A90E2' : '#666666',
      parentId: parentBox?.id,
      zIndex,
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType') as NodeType;
    const nodeId = e.dataTransfer.getData('nodeId');
    const isExistingNode = e.dataTransfer.getData('existingNode') === 'true';

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isExistingNode && nodeId) {
      // Moving existing node
      console.log('Moving node:', nodeId, 'to', x, y);
      
      const updatedNodes = diagramState.nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            position: {
              x: Math.max(0, x - 50), // Center the node on cursor
              y: Math.max(0, y - 25),
            },
          };
        }
        return node;
      });

      const newState = {
        ...diagramState,
        nodes: updatedNodes,
      };
      
      onDiagramChange(newState);
    } else if (nodeType) {
      // Creating new node from palette
      console.log('Dropping new node:', nodeType, 'at', x, y);

      const newNode = createNode(nodeType, Math.max(0, x - 50), Math.max(0, y - 25));
      
      const newState = {
        ...diagramState,
        nodes: [...diagramState.nodes, newNode],
      };
      
      onDiagramChange(newState);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (diagramState.mode === 'connect') {
      if (!connectingFrom) {
        // Start connection
        setConnectingFrom(nodeId);
        console.log('Starting connection from:', nodeId);
      } else if (connectingFrom !== nodeId) {
        // Complete connection
        const newConnection = createConnection(connectingFrom, nodeId);
        console.log('Creating connection:', connectingFrom, '->', nodeId);
        
        const newState = {
          ...diagramState,
          connections: [...diagramState.connections, newConnection],
        };
        onDiagramChange(newState);
        setConnectingFrom(null);
      } else {
        // Cancel connection (clicked same node)
        setConnectingFrom(null);
      }
    } else {
      // Select mode
      const newState = {
        ...diagramState,
        selectedNode: diagramState.selectedNode === nodeId ? null : nodeId,
        selectedConnection: null,
        selectedBoundingBox: null,
      };
      onDiagramChange(newState);
    }
  };

  const handleNodeLabelChange = (nodeId: string, newLabel: string) => {
    const updatedNodes = diagramState.nodes.map(node =>
      node.id === nodeId ? { ...node, label: newLabel } : node
    );
    
    const newState = {
      ...diagramState,
      nodes: updatedNodes,
    };
    onDiagramChange(newState);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only handle if clicking directly on canvas (not on child elements)
    if (e.target !== e.currentTarget) return;
    
    if (diagramState.mode === 'boundingBox' && !isDrawingBoundingBox) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setBoundingBoxStart({ x, y });
      setIsDrawingBoundingBox(true);
      console.log('Starting bounding box at:', x, y);
    } else if (diagramState.mode === 'connect') {
      // Cancel connection if clicking on empty space
      setConnectingFrom(null);
    }
  };

  const [currentBoundingBox, setCurrentBoundingBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (diagramState.mode === 'boundingBox' && isDrawingBoundingBox && boundingBoxStart) {
      const rect = e.currentTarget.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      const x = Math.min(boundingBoxStart.x, currentX);
      const y = Math.min(boundingBoxStart.y, currentY);
      const width = Math.abs(currentX - boundingBoxStart.x);
      const height = Math.abs(currentY - boundingBoxStart.y);
      
      setCurrentBoundingBox({ x, y, width, height });
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (diagramState.mode === 'boundingBox' && isDrawingBoundingBox && boundingBoxStart) {
      const rect = e.currentTarget.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
      
      const x = Math.min(boundingBoxStart.x, endX);
      const y = Math.min(boundingBoxStart.y, endY);
      const width = Math.abs(endX - boundingBoxStart.x);
      const height = Math.abs(endY - boundingBoxStart.y);
      
      console.log('Ending bounding box:', { x, y, width, height });
      
      if (width > 20 && height > 20) { // Minimum size
        const newBoundingBox = createBoundingBox(x, y, width, height);
        console.log('Creating bounding box:', newBoundingBox);
        const newState = {
          ...diagramState,
          boundingBoxes: [...diagramState.boundingBoxes, newBoundingBox],
        };
        onDiagramChange(newState);
      }
      
      setIsDrawingBoundingBox(false);
      setBoundingBoxStart(null);
      setCurrentBoundingBox(null);
    }
  };

  const clearCanvas = () => {
    const newState: DiagramState = {
      nodes: [],
      connections: [],
      boundingBoxes: [],
      selectedNode: null,
      selectedConnection: null,
      selectedBoundingBox: null,
      mode: diagramState.mode,
    };
    onDiagramChange(newState);
    setConnectingFrom(null);
    setIsDrawingBoundingBox(false);
    setBoundingBoxStart(null);
    setCurrentBoundingBox(null);
  };

  // Context menu handlers
  const handleCanvasContextMenu = (event: React.MouseEvent) => {
    const items: ContextMenuItem[] = [
      {
        id: 'paste',
        label: 'Paste',
        icon: <Clipboard size={16} />,
        disabled: !hasClipboard,
        onClick: onPaste,
      },
      { id: 'sep1', separator: true },
      {
        id: 'clearAll',
        label: 'Clear All',
        icon: <X size={16} />,
        onClick: clearCanvas,
      },
    ];
    
    onShowContextMenu(event, items);
  };

  const handleNodeContextMenu = (event: React.MouseEvent, nodeId: string) => {
    const node = diagramState.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const items: ContextMenuItem[] = [
      {
        id: 'changeType',
        label: 'Change Shape',
        icon: <MousePointer size={16} />,
        submenu: [
          { id: 'rect', label: 'Rectangle', icon: <Square size={14} />, onClick: () => updateNodeType(nodeId, 'rect') },
          { id: 'circle', label: 'Circle', icon: <Circle size={14} />, onClick: () => updateNodeType(nodeId, 'circle') },
          { id: 'diamond', label: 'Diamond', icon: <Diamond size={14} />, onClick: () => updateNodeType(nodeId, 'diamond') },
          { id: 'hexagon', label: 'Hexagon', onClick: () => updateNodeType(nodeId, 'hexagon') },
          { id: 'stadium', label: 'Stadium', onClick: () => updateNodeType(nodeId, 'stadium') },
          { id: 'subroutine', label: 'Subroutine', icon: <Square size={14} />, onClick: () => updateNodeType(nodeId, 'subroutine') },
        ],
      },
      { id: 'sep1', separator: true },
      {
        id: 'copy',
        label: 'Copy',
        icon: <Copy size={16} />,
        onClick: () => {
          const newState = { ...diagramState, selectedNode: nodeId };
          onDiagramChange(newState);
          onCopy();
        },
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 size={16} />,
        onClick: () => {
          const newState = { ...diagramState, selectedNode: nodeId };
          onDiagramChange(newState);
          onDelete();
        },
      },
    ];
    
    onShowContextMenu(event, items);
  };

  const updateNodeType = (nodeId: string, newType: NodeType) => {
    const updatedNodes = diagramState.nodes.map(node =>
      node.id === nodeId ? { ...node, type: newType } : node
    );
    
    onDiagramChange({
      ...diagramState,
      nodes: updatedNodes,
    });
  };

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Canvas
        </button>
      </div>
        <div
          ref={canvasRef}
          id="canvas"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onContextMenu={handleCanvasContextMenu}
          className={`relative w-full h-96 bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden ${
            diagramState.mode === 'boundingBox' ? 'cursor-crosshair' : 
            diagramState.mode === 'connect' ? 'cursor-pointer' : 'cursor-default'
          }`}
          style={{ minHeight: '600px' }}
        >
          {/* Render bounding boxes sorted by zIndex (nested ones on top) */}
          {diagramState.boundingBoxes
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
            .map((box) => (
            <BoundingBoxComponent
              key={box.id}
              boundingBox={box}
              isSelected={diagramState.selectedBoundingBox === box.id}
              onClick={() => {
                const newState = {
                  ...diagramState,
                  selectedBoundingBox: diagramState.selectedBoundingBox === box.id ? null : box.id,
                  selectedNode: null,
                  selectedConnection: null,
                };
                onDiagramChange(newState);
              }}
              onLabelChange={(newLabel) => {
                const updatedBoxes = diagramState.boundingBoxes.map(b =>
                  b.id === box.id ? { ...b, label: newLabel } : b
                );
                const newState = { ...diagramState, boundingBoxes: updatedBoxes };
                onDiagramChange(newState);
              }}
              onMove={() => {}} // TODO: Implement bounding box movement
              onResize={() => {}} // TODO: Implement bounding box resizing
            />
          ))}

          {/* Preview bounding box while drawing */}
          {currentBoundingBox && (
            <div
              className="absolute border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-20 pointer-events-none"
              style={{
                left: currentBoundingBox.x,
                top: currentBoundingBox.y,
                width: currentBoundingBox.width,
                height: currentBoundingBox.height,
              }}
            />
          )}

          <ConnectionLayer 
            connections={diagramState.connections} 
            nodes={diagramState.nodes}
            selectedConnection={diagramState.selectedConnection}
            onConnectionClick={(connectionId) => {
              const newState = {
                ...diagramState,
                selectedConnection: diagramState.selectedConnection === connectionId ? null : connectionId,
                selectedNode: null,
                selectedBoundingBox: null,
              };
              onDiagramChange(newState);
            }}
          />
          
          {/* Highlight connecting node */}
          {connectingFrom && (
            <div className="absolute inset-0 pointer-events-none">
              {diagramState.nodes
                .filter(node => node.id === connectingFrom)
                .map(node => (
                  <div
                    key={node.id}
                    className="absolute border-2 border-blue-500 rounded animate-pulse"
                    style={{
                      left: node.position.x - 2,
                      top: node.position.y - 2,
                      width: 100, // Approximate node width + border
                      height: 52,  // Approximate node height + border
                    }}
                  />
                ))}
            </div>
          )}
          
          {diagramState.nodes.map((node) => (
            <NodeComponent
              key={node.id}
              node={node}
              isSelected={diagramState.selectedNode === node.id}
              mode={diagramState.mode}
              onClick={() => handleNodeClick(node.id)}
              onLabelChange={(newLabel) => handleNodeLabelChange(node.id, newLabel)}
              onMove={() => {}} // Not used since we handle movement via drag/drop
              onContextMenu={(event) => handleNodeContextMenu(event, node.id)}
            />
          ))}
        </div>
    </div>
  );
};