export interface MermaidNode {
  id: string;
  type: 'rect' | 'circle' | 'diamond' | 'hexagon' | 'stadium' | 'subroutine';
  position: { x: number; y: number };
  label: string;
  connections: string[];
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  label?: string;
  type: 'arrow' | 'line' | 'dotted';
  color?: string;
}

export interface BoundingBox {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  label: string;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  parentId?: string; // ID of parent bounding box if nested
  zIndex: number; // For rendering order
}

export interface DiagramState {
  nodes: MermaidNode[];
  connections: Connection[];
  boundingBoxes: BoundingBox[];
  selectedNode: string | null;
  selectedConnection: string | null;
  selectedBoundingBox: string | null;
  mode: 'select' | 'connect' | 'boundingBox';
}

export type NodeType = MermaidNode['type'];
export type ConnectionType = Connection['type'];
export type ToolMode = DiagramState['mode'];