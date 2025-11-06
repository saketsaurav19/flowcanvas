# Project Overview

This is a [Next.js](https://nextjs.org/) project called "flowcanvas" that provides a node-based editor using the [@xyflow/react](https://reactflow.dev/) library. The application allows users to add different types of nodes (text, image, colored), group them, and edit their properties.

The main components are:
- **`FlowCanvas`**: The core component that renders the React Flow canvas and manages node-related logic.
- **`Sidebar`**: A component that allows users to add new nodes to the canvas.
- **`PropertySidebar`**: A component that appears when a node is double-clicked, allowing users to edit the node's properties.
- **Custom Nodes**: The application defines several custom node types: `TextNode`, `ImageNode`, `ColoredNode`, and `GroupNode`.

# Building and Running

To run the project in development mode, use the following command:

```bash
npm run dev
```

This will start the development server on [http://localhost:3000](http://localhost:3000).

To build the project for production, use:

```bash
npm run build
```

To start the production server, use:

```bash
npm run start
```

# Development Conventions

- The project uses CSS Modules for styling, as seen in `src/app/page.module.css`.
- The code is written in JavaScript and uses React hooks.
- The project follows the standard Next.js project structure.
- The `@xyflow/react` library is used for creating the node-based editor.
- The `English2.json` file now includes a `use_case` field for each node, describing its purpose within the node-based editor.
