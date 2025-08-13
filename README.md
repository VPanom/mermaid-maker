# Mermaid Maker

A visual drag-and-drop interface for creating Mermaid diagrams. This application provides an intuitive canvas-based editor that generates Mermaid syntax automatically, eliminating the need to write diagram code manually.

## Features

- Drag-and-drop node placement from a component palette
- Support for multiple node types: rectangle, circle, diamond, hexagon, stadium, subroutine
- Visual connection system for linking nodes with arrows
- Bounding box creation for grouping elements with nested hierarchy
- Real-time Mermaid diagram preview and syntax generation
- Undo/redo functionality with complete state history
- Copy/paste operations for diagram elements
- Context menu system with element-specific actions
- Properties panel for customizing colors, borders, and styling
- Auto-save functionality with 30-second intervals
- Import/export capabilities for JSON project files, SVG images, and Mermaid code

## Installation

```bash
git clone <repository-url>
cd mermaid-maker
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

## Technology Stack

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Mermaid.js for diagram rendering
- Lucide React for icons
- HTML5 Drag and Drop API

## Usage

1. Drag shapes from the left palette onto the canvas
2. Use the connection tool to link nodes by clicking between them
3. Create bounding boxes by selecting the bounding box tool and dragging on the canvas
4. Customize element properties using the right-side panel
5. View the generated Mermaid diagram in the preview pane
6. Export diagrams as SVG, Mermaid code, or save projects as JSON files

## Keyboard Shortcuts

- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo  
- `Ctrl+C` - Copy selected element
- `Ctrl+V` - Paste element
- `Ctrl+S` - Save project
- `Ctrl+O` - Load project
- `Delete` - Delete selected element
