# 🎨 FlowCanvas

**FlowCanvas** is a powerful, interactive node-based editor built with [Next.js](https://nextjs.org/) and [React Flow (@xyflow/react)](https://reactflow.dev/). It allows users to create, manage, and visualize complex workflows with ease.

## ✨ Features

- **Custom Node Types**:
  - 📝 **Text Node**: Simple text containers for labels and titles.
  - 🖼️ **Image Node**: Display images via URL or upload.
  - 📒 **Notes Node**: Sticky-note style nodes for annotations.
  - 📦 **Group Node (Subflow)**: Group multiple nodes together with auto-sizing backgrounds.

- **Interactive Editing**:
  - **Property Sidebar**: Double-click any node to edit its properties (label, background color, text color, image source).
  - **Dynamic Resizing**: Nodes and groups can be resized using handles.
  - **Lasso Selection**: Select multiple nodes to move or group them.

- **Advanced Grouping**:
  - **Auto-Sizing**: Groups automatically calculate dimensions to fit selected nodes.
  - **Random Colors**: New groups get assigned a random, semi-transparent background color for visual distinction.

- **State Management**:
  - **Save & Load**: Persist your flows to JSON files or save them to the server.
  - **Drag & Drop**: Intuitive interface for arranging nodes.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Flow Engine**: [@xyflow/react](https://reactflow.dev/)
- **Styling**: CSS Modules

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js installed on your machine.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/flowcanvas.git
    cd flowcanvas
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### Adding Nodes
Use the **Sidebar** on the left to add new nodes:
- Click **"Add Text Node"** to spawn a text block.
- Click **"Add Image Node"** to spawn an image placeholder.
- Click **"Add Note"** to create a colored sticky note.

### Grouping Nodes
1.  Select multiple nodes using **Shift + Click** or by dragging a **Lasso** around them.
2.  Click the **"Group Nodes"** button in the sidebar.
3.  A new **Group Node** will appear, surrounding your selection with a random background color.

### Editing Properties
- **Double-click** any node to open the **Property Sidebar** on the right.
- **Text/Notes**: Change label, background color, text color.
- **Images**: Update image URL or upload a file.
- **Groups**: Change background color, assign a random color, or remove color.

### Saving & Loading
- **Save**: Click "Save Flow" to save the current state to the server.
- **Load**: Click "Load Flow" to browse and restore previously saved flows.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
