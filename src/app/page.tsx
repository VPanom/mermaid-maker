'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@/components/Canvas';
import { NodePalette } from '@/components/NodePalette';
import { MermaidPreview } from '@/components/MermaidPreview';
import { Toolbar } from '@/components/Toolbar';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { DiagramState, ToolMode } from '@/types';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { Download, FileText, Image as ImageIcon, Save, FolderOpen, Upload } from 'lucide-react';

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

  const [clipboard, setClipboard] = useState<{
    type: 'node' | 'connection' | 'boundingBox';
    data: any;
  } | null>(null);

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

  const handleCopy = () => {
    if (diagramState.selectedNode) {
      const node = diagramState.nodes.find(n => n.id === diagramState.selectedNode);
      if (node) {
        setClipboard({ type: 'node', data: node });
      }
    } else if (diagramState.selectedConnection) {
      const connection = diagramState.connections.find(c => c.id === diagramState.selectedConnection);
      if (connection) {
        setClipboard({ type: 'connection', data: connection });
      }
    } else if (diagramState.selectedBoundingBox) {
      const boundingBox = diagramState.boundingBoxes.find(b => b.id === diagramState.selectedBoundingBox);
      if (boundingBox) {
        setClipboard({ type: 'boundingBox', data: boundingBox });
      }
    }
  };

  const handlePaste = () => {
    if (!clipboard) return;

    let newState = { ...diagramState };
    
    if (clipboard.type === 'node') {
      const originalNode = clipboard.data;
      const newNode = {
        ...originalNode,
        id: `node_${Date.now()}`,
        position: {
          x: originalNode.position.x + 50,
          y: originalNode.position.y + 50,
        },
        connections: [],
      };
      newState.nodes = [...newState.nodes, newNode];
      newState.selectedNode = newNode.id;
      newState.selectedConnection = null;
      newState.selectedBoundingBox = null;
    } else if (clipboard.type === 'boundingBox') {
      const originalBox = clipboard.data;
      const newBox = {
        ...originalBox,
        id: `box_${Date.now()}`,
        position: {
          x: originalBox.position.x + 50,
          y: originalBox.position.y + 50,
        },
        parentId: undefined, // Don't copy parent relationships
        zIndex: Math.max(0, ...diagramState.boundingBoxes.map(b => b.zIndex || 0)) + 1,
      };
      newState.boundingBoxes = [...newState.boundingBoxes, newBox];
      newState.selectedBoundingBox = newBox.id;
      newState.selectedNode = null;
      newState.selectedConnection = null;
    }

    pushToHistory(newState);
  };

  const handleSave = () => {
    try {
      const saveData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        diagramState: {
          ...diagramState,
          selectedNode: null,
          selectedConnection: null,
          selectedBoundingBox: null,
        }
      };
      localStorage.setItem('mermaid-diagram', JSON.stringify(saveData));
      
      // Also trigger a download as backup
      const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mermaid-diagram-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to save diagram:', error);
    }
  };

  const handleLoad = () => {
    try {
      const savedData = localStorage.getItem('mermaid-diagram');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.diagramState) {
          pushToHistory(parsed.diagramState);
        }
      }
    } catch (error) {
      console.error('Failed to load diagram:', error);
    }
  };

  const handleLoadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed.diagramState) {
            pushToHistory(parsed.diagramState);
          }
        } catch (error) {
          console.error('Failed to load file:', error);
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = '';
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (diagramState.nodes.length > 0 || diagramState.connections.length > 0 || diagramState.boundingBoxes.length > 0) {
        try {
          const saveData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            diagramState: {
              ...diagramState,
              selectedNode: null,
              selectedConnection: null,
              selectedBoundingBox: null,
            }
          };
          localStorage.setItem('mermaid-diagram-autosave', JSON.stringify(saveData));
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSave);
  }, [diagramState]);

  // Load auto-saved data on component mount
  useEffect(() => {
    try {
      const autoSavedData = localStorage.getItem('mermaid-diagram-autosave');
      if (autoSavedData && (!diagramState.nodes.length && !diagramState.connections.length && !diagramState.boundingBoxes.length)) {
        const parsed = JSON.parse(autoSavedData);
        if (parsed.diagramState) {
          pushToHistory(parsed.diagramState);
        }
      }
    } catch (error) {
      console.error('Failed to load auto-saved data:', error);
    }
  }, []); // Only run once on mount

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

      // Save/Load shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault();
        handleLoad();
        return;
      }

      // Copy/Paste shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        if (hasSelection) {
          e.preventDefault();
          handleCopy();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        if (clipboard) {
          e.preventDefault();
          handlePaste();
        }
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
  }, [diagramState, undo, redo, handleDelete, hasSelection, handleCopy, handlePaste, clipboard, handleSave, handleLoad]);

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
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                title="Save diagram (Ctrl+S)"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={handleLoad}
                className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                title="Load diagram (Ctrl+O)"
              >
                <FolderOpen size={16} />
                Load
              </button>
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer">
                <Upload size={16} />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleLoadFromFile}
                  className="hidden"
                />
              </label>
              <button
                onClick={exportSVG}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <ImageIcon size={16} />
                Export SVG
              </button>
              <button
                onClick={exportCode}
                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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
          onCopy={handleCopy}
          onPaste={handlePaste}
          hasSelection={hasSelection}
          hasClipboard={!!clipboard}
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
          
          <PropertiesPanel 
            diagramState={diagramState} 
            onDiagramChange={handleDiagramChange} 
          />
        </div>
      </div>
    </div>
  );
}