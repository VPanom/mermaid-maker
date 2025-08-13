'use client';

import React from 'react';
import { Connection, MermaidNode } from '@/types';

interface ConnectionLayerProps {
  connections: Connection[];
  nodes: MermaidNode[];
  selectedConnection?: string | null;
  onConnectionClick?: (connectionId: string) => void;
}

export const ConnectionLayer: React.FC<ConnectionLayerProps> = ({ connections, nodes, selectedConnection, onConnectionClick }) => {
  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    let width = 96; // Default width (w-24 = 96px)
    let height = 48; // Default height (h-12 = 48px)
    
    switch (node.type) {
      case 'circle':
        width = height = 64; // w-16 = 64px
        break;
      case 'diamond':
        width = height = 64;
        break;
      case 'hexagon':
        width = 80; // w-20 = 80px
        height = 48;
        break;
    }
    
    return {
      x: node.position.x + width / 2,
      y: node.position.y + height / 2,
    };
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {connections.map((connection) => {
        const fromCenter = getNodeCenter(connection.from);
        const toCenter = getNodeCenter(connection.to);
        const isSelected = selectedConnection === connection.id;
        const strokeColor = isSelected ? '#3B82F6' : '#374151';
        const strokeWidth = isSelected ? '3' : '2';
        
        return (
          <g key={connection.id}>
            {/* Invisible thick line for easier clicking */}
            <line
              x1={fromCenter.x}
              y1={fromCenter.y}
              x2={toCenter.x}
              y2={toCenter.y}
              stroke="transparent"
              strokeWidth="10"
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onClick={() => onConnectionClick?.(connection.id)}
            />
            
            {/* Visible connection line */}
            <line
              x1={fromCenter.x}
              y1={fromCenter.y}
              x2={toCenter.x}
              y2={toCenter.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={connection.type === 'dotted' ? '5,5' : undefined}
              style={{ pointerEvents: 'none' }}
            />
            
            {connection.type === 'arrow' && (
              <defs>
                <marker
                  id={`arrowhead-${connection.id}`}
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill={strokeColor}
                  />
                </marker>
              </defs>
            )}
            {connection.type === 'arrow' && (
              <line
                x1={fromCenter.x}
                y1={fromCenter.y}
                x2={toCenter.x}
                y2={toCenter.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                markerEnd={`url(#arrowhead-${connection.id})`}
                className="pointer-events-none"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};