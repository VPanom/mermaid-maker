'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { DiagramState } from '@/types';

interface MermaidPreviewProps {
  diagramState: DiagramState;
}

export const MermaidPreview: React.FC<MermaidPreviewProps> = ({ diagramState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mermaidCode, setMermaidCode] = React.useState('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'monospace',
    });
  }, []);

  const isNodeInsideBoundingBox = (node: any, box: any) => {
    const nodeX = node.position.x;
    const nodeY = node.position.y;
    const nodeWidth = 96; // Approximate node width
    const nodeHeight = 48; // Approximate node height
    
    return (
      nodeX >= box.position.x &&
      nodeY >= box.position.y &&
      nodeX + nodeWidth <= box.position.x + box.size.width &&
      nodeY + nodeHeight <= box.position.y + box.size.height
    );
  };

  const generateMermaidCode = (state: DiagramState): string => {
    if (state.nodes.length === 0) {
      return 'graph TD\n    A[No nodes yet]\n    A --> B[Drag nodes from the palette]';
    }

    let code = 'graph TD\n';
    
    // Create a map of which nodes belong to which bounding boxes (deepest first)
    const nodeToBoxMap = new Map<string, string>();
    
    // Sort boxes by zIndex descending to prioritize deepest nested boxes
    const sortedBoxes = [...state.boundingBoxes].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
    
    sortedBoxes.forEach(box => {
      state.nodes.forEach(node => {
        // Only assign if node isn't already assigned to a deeper box
        if (!nodeToBoxMap.has(node.id) && isNodeInsideBoundingBox(node, box)) {
          nodeToBoxMap.set(node.id, box.id);
        }
      });
    });

    // Add standalone nodes first (nodes not in any bounding box)
    state.nodes.forEach(node => {
      if (!nodeToBoxMap.has(node.id)) {
        const nodeId = node.id.replace(/[^a-zA-Z0-9]/g, '');
        let nodeShape = '';
        
        switch (node.type) {
          case 'rect':
            nodeShape = `[${node.label}]`;
            break;
          case 'circle':
            nodeShape = `((${node.label}))`;
            break;
          case 'diamond':
            nodeShape = `{${node.label}}`;
            break;
          case 'hexagon':
            nodeShape = `{{${node.label}}}`;
            break;
          case 'stadium':
            nodeShape = `([${node.label}])`;
            break;
          case 'subroutine':
            nodeShape = `[[${node.label}]]`;
            break;
          default:
            nodeShape = `[${node.label}]`;
        }
        
        code += `    ${nodeId}${nodeShape}\n`;
      }
    });

    // Create a hierarchical structure for nested boxes
    const processBoxHierarchy = (parentId: string | undefined, indentLevel: number = 1) => {
      const indent = '    '.repeat(indentLevel);
      
      state.boundingBoxes
        .filter(box => box.parentId === parentId)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        .forEach(box => {
          const boxId = box.id.replace(/[^a-zA-Z0-9]/g, '');
          code += `${indent}subgraph ${boxId} ["${box.label}"]\n`;
          
          // Add nodes directly inside this box (not in any child box)
          state.nodes.forEach(node => {
            if (nodeToBoxMap.get(node.id) === box.id) {
              // Check if this node is not in any child box
              const isInChildBox = state.boundingBoxes.some(childBox => 
                childBox.parentId === box.id && isNodeInsideBoundingBox(node, childBox)
              );
              
              if (!isInChildBox) {
                const nodeId = node.id.replace(/[^a-zA-Z0-9]/g, '');
                let nodeShape = '';
                
                switch (node.type) {
                  case 'rect':
                    nodeShape = `[${node.label}]`;
                    break;
                  case 'circle':
                    nodeShape = `((${node.label}))`;
                    break;
                  case 'diamond':
                    nodeShape = `{${node.label}}`;
                    break;
                  case 'hexagon':
                    nodeShape = `{{${node.label}}}`;
                    break;
                  case 'stadium':
                    nodeShape = `([${node.label}])`;
                    break;
                  case 'subroutine':
                    nodeShape = `[[${node.label}]]`;
                    break;
                  default:
                    nodeShape = `[${node.label}]`;
                }
                
                code += `${indent}    ${nodeId}${nodeShape}\n`;
              }
            }
          });
          
          // Recursively process child boxes
          processBoxHierarchy(box.id, indentLevel + 1);
          
          code += `${indent}end\n`;
        });
    };

    // Process top-level boxes (no parent)
    processBoxHierarchy(undefined);

    // Add connections
    state.connections.forEach(connection => {
      const fromId = connection.from.replace(/[^a-zA-Z0-9]/g, '');
      const toId = connection.to.replace(/[^a-zA-Z0-9]/g, '');
      let arrow = '-->';
      
      if (connection.type === 'dotted') {
        arrow = '-..->';
      } else if (connection.type === 'line') {
        arrow = '---';
      }
      
      const label = connection.label ? `|${connection.label}|` : '';
      code += `    ${fromId} ${arrow}${label} ${toId}\n`;
    });

    // Add styling for nodes
    let styleIndex = 0;
    state.nodes.forEach(node => {
      const nodeId = node.id.replace(/[^a-zA-Z0-9]/g, '');
      
      if (node.backgroundColor || node.textColor || node.borderColor) {
        code += `    classDef style${styleIndex} `;
        
        if (node.backgroundColor) {
          code += `fill:${node.backgroundColor}`;
        }
        if (node.textColor) {
          code += `${node.backgroundColor ? ',' : ''}color:${node.textColor}`;
        }
        if (node.borderColor) {
          code += `${(node.backgroundColor || node.textColor) ? ',' : ''}stroke:${node.borderColor}`;
        }
        if (node.borderWidth) {
          code += `${(node.backgroundColor || node.textColor || node.borderColor) ? ',' : ''}stroke-width:${node.borderWidth}px`;
        }
        
        code += `\n`;
        code += `    class ${nodeId} style${styleIndex}\n`;
        styleIndex++;
      }
    });

    // Add styling for connections
    state.connections.forEach((connection, index) => {
      if (connection.color) {
        const fromId = connection.from.replace(/[^a-zA-Z0-9]/g, '');
        const toId = connection.to.replace(/[^a-zA-Z0-9]/g, '');
        code += `    linkStyle ${index} stroke:${connection.color}\n`;
      }
    });

    return code;
  };

  useEffect(() => {
    const code = generateMermaidCode(diagramState);
    setMermaidCode(code);

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const element = document.createElement('div');
      element.className = 'mermaid';
      element.textContent = code;
      containerRef.current.appendChild(element);
      
      mermaid.init(undefined, element);
    }
  }, [diagramState]);

  return (
    <div className="w-full h-full bg-white border border-gray-300 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Mermaid Preview</h3>
      </div>
      
      <div className="p-4">
        <div 
          ref={containerRef}
          className="min-h-64 flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300"
        />
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Code</h4>
        <textarea
          value={mermaidCode}
          readOnly
          className="w-full h-32 p-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded resize-none"
          placeholder="Mermaid code will appear here..."
        />
      </div>
    </div>
  );
};