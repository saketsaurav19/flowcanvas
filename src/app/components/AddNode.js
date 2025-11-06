"use client";
import React, { useCallback, useRef, useState , useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
    getIncomers,
  getOutgoers,
  getConnectedEdges,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Sidebar from "./sidebar";
import { TextNode, ImageNode } from "./customNodes";
import { NotesNode } from "./NotesNode";
import GroupNode from "./GroupNode"; // Custom node with resizer
import PropertySidebar from "./PropertySidebar";
import FileListOverlay from "./FileListOverlay";

const nodeTypes = {
  textNode: TextNode,
  imageNode: ImageNode,
  notesNode: NotesNode,
  subflow: GroupNode,
};

const initialNodes = [];
const initialEdges = [];

const FlowCanvas = () => {
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef(null);
  const { getNodes, deleteElements } = useReactFlow();
  const nodeId = useRef(1);

  const getId = () => `dndnode_${nodeId.current++}`;

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showFileOverlay, setShowFileOverlay] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [openedFileName, setOpenedFileName] = useState(null);

  const handleInit = useCallback((instance) => {
    reactFlowInstance.current = instance;
  }, []);

  const handleAddNode = useCallback(
    (type = "textNode") => {
      const wrapper = reactFlowWrapper.current;
      const instance = reactFlowInstance.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();

      // Generate a random position in DOM space (within the visible wrapper)
      const domX = 50 + Math.random() * (rect.width - 150);
      const domY = 50 + Math.random() * (rect.height - 150);

      // Convert DOM coordinates → Flow coordinates
      const position = instance.screenToFlowPosition({
        x: domX,
        y: domY,
      });

      const newId = getId();
      const newNode = {
        id: newId,
        type,
        position,
        data: { label: `Node ${newId}` },
      };

      if (type === "imageNode") {
        newNode.data.src = "https://picsum.photos/100";
      } else if (type === "notesNode") {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        newNode.data.color = `rgb(${r},${g},${b})`;
        newNode.data.label = "New Note";

        if (selectedNode) {
          const newEdge = {
            id: `edge-${selectedNode.id}-${newNode.id}`,
            source: selectedNode.id,
            target: newNode.id,
          };
          setEdges((eds) => addEdge(newEdge, eds));
        }
      }

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, setEdges, selectedNode]
  );

  const handleGroupNodes = useCallback(() => {
    if (!reactFlowInstance.current) return;

    const selected = reactFlowInstance.current.getNodes().filter((n) => n.selected);
    if (selected.length < 2) return alert("Select at least 2 nodes");

    const minX = Math.min(...selected.map((n) => n.position.x));
    const minY = Math.min(...selected.map((n) => n.position.y));
    const maxX = Math.max(...selected.map((n) => n.position.x + (n.width || 150)));
    const maxY = Math.max(...selected.map((n) => n.position.y + (n.height || 100)));
    const padding = 30;

    const subflowId = `subflow-${Date.now()}`;
    const groupPos = { x: minX - padding, y: minY - padding };

    const subflowNode = {
      id: subflowId,
      type: "subflow",
      position: groupPos,
      data: { label: `` },
      draggable: true,
      selectable: true,
    };

    const children = selected.map((n) => ({
      ...n,
      parentId: subflowId,
      extent: "parent",
      position: { x: n.position.x - groupPos.x, y: n.position.y - groupPos.y },
    }));

    setNodes((nds) => [...nds.filter((n) => !n.selected), subflowNode, ...children]);
  }, [setNodes]);

 const onConnect = useCallback(
  (params) =>
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          style: { stroke: "#ff0000" },
          markerEnd: { type: "arrow", color: "#ff0000" },
        },
        eds
      )
    ),
  [setEdges]
);

  console.table(nodes);
  console.table(edges);

  const handleNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const handleNodeDoubleClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  // 🟢 Update node properties
  const handleUpdateNode = useCallback((id, newData) => {
    setNodes((nds) => {
      const newNodes = nds.map((n) => {
        if (n.id === id) {
          const updatedNode = { ...n, data: { ...n.data, ...newData } };
          return updatedNode;
        }
        return n;
      });
      const updatedNode = newNodes.find(n => n.id === id);
      setSelectedNode(updatedNode);
      return newNodes;
    });
  }, [setNodes]);

   const onNodesDelete = useCallback(
    (deleted) => {
      let remainingNodes = [...nodes];
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, remainingNodes, acc);
          const outgoers = getOutgoers(node, remainingNodes, acc);
          const connectedEdges = getConnectedEdges([node], acc);
 
          const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));
 
          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            })),
          );
 
          remainingNodes = remainingNodes.filter((rn) => rn.id !== node.id);
 
          return [...remainingEdges, ...createdEdges];
        }, edges),
      );
    },
    [nodes, edges],
  );

    // ✅ This listens for both Backspace and Delete keys
  const handleKeyDown = useCallback(
    (event) => {
      if ( event.key === 'Delete') {
        event.preventDefault(); // avoid browser navigation
        const selectedNodes = getNodes().filter((n) => n.selected);
        if (selectedNodes.length > 0) {
          deleteElements({ nodes: selectedNodes });
        }
      }
    },
    [getNodes, deleteElements]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleLoadFlow = useCallback((flow, fileName = null) => {
    if (!flow) return;

    const migratedNodes = flow.nodes.map(node => {
      if (node.type === 'coloredNode') {
        return { ...node, type: 'textNode' };
      }
      return node;
    });

    setNodes(migratedNodes || []);
    setEdges(flow.edges || []);
    reactFlowInstance.current?.setViewport(flow.viewport || { x: 0, y: 0, zoom: 1 });
    reactFlowInstance.current?.fitView();

    // Update the nodeId ref to avoid collisions
    let maxId = 0;
    flow.nodes.forEach(node => {
      if (node.id.startsWith('dndnode_')) {
        const idNum = parseInt(node.id.split('_')[1], 10);
        if (idNum > maxId) {
          maxId = idNum;
        }
      }
    });
    nodeId.current = maxId + 1;

    setOpenedFileName(fileName);
  }, [setNodes, setEdges, setOpenedFileName]);

  const handleSaveToPublic = useCallback(async () => {
    if (!reactFlowInstance.current) return;

    const flow = reactFlowInstance.current.toObject();
    let fileName = openedFileName;

    if (!fileName) {
      fileName = prompt('Enter a name for your flow:');
      if (!fileName) return;
    }

    // Remove .json extension if it exists
    if (fileName.endsWith('.json')) {
      fileName = fileName.slice(0, -5);
    }

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: fileName, data: flow }),
      });

      if (response.ok) {
        alert('Flow saved successfully!');
        setOpenedFileName(fileName);
      } else {
        const { error } = await response.json();
        alert(`Error saving flow: ${error}`);
      }
    } catch (error) {
      console.error('Error saving flow:', error);
      alert('An unexpected error occurred while saving the flow.');
    }
  }, [reactFlowInstance, openedFileName, setOpenedFileName]);

  const handleUploadFromPublic = useCallback(async () => {
    try {
      const response = await fetch('/api/files');
      const files = await response.json();
      setFileList(files);
      setShowFileOverlay(true);
    } catch (error) {
      console.error('Error loading flow:', error);
      alert('An unexpected error occurred while loading the flow.');
    }
  }, []);

  const handleFileSelect = useCallback(async (fileName) => {
    try {
      const fileResponse = await fetch(`/uploads/${fileName}`);
      const flow = await fileResponse.json();
      handleLoadFlow(flow, fileName);
      setShowFileOverlay(false);
    } catch (error) {
      console.error('Error loading flow:', error);
      alert('An unexpected error occurred while loading the flow.');
    }
  }, [handleLoadFlow]);

  const handleCloseOverlay = useCallback(() => {
    setShowFileOverlay(false);
  }, []);


  return (
    <div style={{ width: "100%", height: "100vh" }} ref={reactFlowWrapper}>
      <ReactFlow
        onInit={handleInit}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodesDelete={onNodesDelete}
        fitView
        minZoom = "0.06"
        deleteKeyCode = "Delete"
      >
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
          <Sidebar 
            onAddNode={handleAddNode} 
            onGroupNodes={handleGroupNodes}
            reactFlowInstance={reactFlowInstance.current}
            onLoadFlow={handleLoadFlow}
            onSaveToPublic={handleSaveToPublic}
            onUploadFromPublic={handleUploadFromPublic}
          />
        </div>
        <Background />
        <Controls />
        <MiniMap />
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
          <PropertySidebar
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNode} // ✅ new prop
          />
        </div>
      </ReactFlow>
      {showFileOverlay && (
        <FileListOverlay
          files={fileList}
          onSelect={handleFileSelect}
          onClose={handleCloseOverlay}
        />
      )}
    </div>
  );
};

export default FlowCanvas;