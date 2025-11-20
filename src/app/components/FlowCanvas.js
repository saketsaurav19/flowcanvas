"use client";
import React, { useCallback, useRef, useState, useEffect } from "react";
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
import Sidebar from "./Sidebar";
import { TextNode, ImageNode } from "./customNodes";
import { NotesNode } from "./NotesNode";
import GroupNode from "./GroupNode";
import Footer from "./Footer";
import PropertySidebar from "./PropertySidebar";
import FileListOverlay from "./FileListOverlay";
import { useNodeOperations } from "../hooks/useNodeOperations";
import { useFileOperations } from "../hooks/useFileOperations";

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
    const nodeIdRef = useRef(1);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState(null);

    // Initialize custom hooks
    const { handleAddNode, handleGroupNodes, handleUpdateNode } = useNodeOperations({
        reactFlowWrapper,
        reactFlowInstance,
        nodeIdRef,
        setNodes,
        setEdges,
        selectedNode,
    });

    const {
        showFileOverlay,
        fileList,
        handleLoadFlow,
        handleSaveFlow,
        handleBrowseExamples,
        handleFileSelect,
        handleUploadFromDisk,
        handleCloseOverlay,
    } = useFileOperations({
        reactFlowInstance,
        nodeIdRef,
        setNodes,
        setEdges,
    });

    // Initialize React Flow instance
    const handleInit = useCallback((instance) => {
        reactFlowInstance.current = instance;
    }, []);

    // Handle edge connections
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

    // Handle node selection
    const handleNodeClick = useCallback((_, node) => {
        setSelectedNode(node);
    }, []);

    const handleNodeDoubleClick = useCallback((_, node) => {
        setSelectedNode(node);
    }, []);

    // Update selected node when nodes change
    useEffect(() => {
        if (selectedNode) {
            const updatedNode = nodes.find(n => n.id === selectedNode.id);
            if (updatedNode) {
                setSelectedNode(updatedNode);
            }
        }
    }, [nodes, selectedNode]);

    // Handle node deletion with edge reconnection
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
                        }))
                    );

                    remainingNodes = remainingNodes.filter((rn) => rn.id !== node.id);
                    return [...remainingEdges, ...createdEdges];
                }, edges)
            );
        },
        [nodes, edges, setEdges]
    );

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback(
        (event) => {
            if (event.key === 'Delete') {
                event.preventDefault();
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
                minZoom={0.06}
                deleteKeyCode="Delete"
            >
                <div
                    style={{
                        position: "absolute",
                        top: "2rem",
                        left: "3rem",
                        zIndex: 10
                    }}
                    className="sidebar-container"
                >
                    <Sidebar
                        onAddNode={handleAddNode}
                        onGroupNodes={handleGroupNodes}
                        onSaveFlow={handleSaveFlow}
                        onLoadFlow={handleLoadFlow}
                        onBrowseExamples={handleBrowseExamples}
                        onUploadFromDisk={handleUploadFromDisk}
                    />
                </div>
                <Background />
                <Controls />
                <MiniMap />
                <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
                    <PropertySidebar
                        node={selectedNode}
                        onClose={() => setSelectedNode(null)}
                        onUpdate={handleUpdateNode}
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
            <Footer />
        </div>
    );
};

export default FlowCanvas;
