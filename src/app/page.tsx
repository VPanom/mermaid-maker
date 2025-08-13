'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@/components/Canvas';
import { NodePalette } from '@/components/NodePalette';
import { MermaidPreview } from '@/components/MermaidPreview';
import { Toolbar } from '@/components/Toolbar';
import { DiagramState, ToolMode } from '@/types';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';

export default function Home() {
  const initialState: DiagramState = {
    nodes: [],
    connections: [],
    boundingBoxes: [],
    selectedNode: null,
    selectedConnection: null,
    selectedBoundingBox: null,
    mode: 'select',
  };

  const { 
    state: diagramState, 
    pushToHistory, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    reset 
  } = useUndoRedo(initialState);

  const handleDiagramChange = (newState: DiagramState) => {
    pushToHistory(newState);
  };

  const handleModeChange = (mode: ToolMode) => {
    const newState = { ...diagramState, mode };
    pushToHistory(newState);
  };

  const hasSelection = !!(
    diagramState.selectedNode || 
    diagramState.selectedConnection || 
    diagramState.selectedBoundingBox
  );

  const handleDelete = () => {
    if (!hasSelection) return;

    let newState = { ...diagramState };

    if (diagramState.selectedNode) {
      // Delete node and any connections involving it
      newState.nodes = newState.nodes.filter(node => node.id !== diagramState.selectedNode);
      newState.connections = newState.connections.filter(
        conn => conn.from !== diagramState.selectedNode && conn.to !== diagramState.selectedNode
      );
      newState.selectedNode = null;
    } else if (diagramState.selectedConnection) {
      // Delete connection
      newState.connections = newState.connections.filter(
        conn => conn.id !== diagramState.selectedConnection
      );
      newState.selectedConnection = null;
    } else if (diagramState.selectedBoundingBox) {
      // Delete bounding box
      newState.boundingBoxes = newState.boundingBoxes.filter(
        box => box.id !== diagramState.selectedBoundingBox
      );
      newState.selectedBoundingBox = null;
    }

    pushToHistory(newState);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Undo/Redo shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete shortcuts
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (hasSelection) {
          handleDelete();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [diagramState, undo, redo, handleDelete, hasSelection]);

  const exportSVG = () => {
    const svgElement = document.querySelector('.mermaid svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement as Element);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mermaid-diagram.svg';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportCode = () => {
    const codeTextarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (codeTextarea && codeTextarea.value) {
      const blob = new Blob([codeTextarea.value], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mermaid-diagram.md';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <NodePalette />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-300 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Mermaid Diagram Generator</h1>
            <div className="flex gap-2">
              <button
                onClick={exportSVG}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <ImageIcon size={16} />
                Export SVG
              </button>
              <button
                onClick={exportCode}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <FileText size={16} />
                Export Code
              </button>
            </div>
          </div>
        </header>

        <Toolbar 
          mode={diagramState.mode} 
          onModeChange={handleModeChange}
          onDelete={handleDelete}
          onUndo={undo}
          onRedo={redo}
          hasSelection={hasSelection}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <div className="flex-1 flex">
          <div className="flex-1 p-4">
            <Canvas diagramState={diagramState} onDiagramChange={handleDiagramChange} />
          </div>
          
          <div className="w-96 p-4">
            <MermaidPreview diagramState={diagramState} />
          </div>
        </div>
      </div>
    </div>
  );
}