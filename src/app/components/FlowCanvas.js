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
import GroupActionPopup from "./GroupActionPopup";
import SettingsModal from "./SettingsModal";
import GeminiPromptModal from "./GeminiPromptModal";
import { generateFlow } from "../utils/geminiGenerator";
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
    const [selectedEdge, setSelectedEdge] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [groupPopupState, setGroupPopupState] = useState({ show: false, node: null, group: null });
    const [showSettings, setShowSettings] = useState(false);
    const [showGeminiModal, setShowGeminiModal] = useState(false);

    const toggleSelectionMode = useCallback(() => {
        setIsSelectionMode((prev) => !prev);
    }, []);

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
        setSelectedEdge(null); // Clear edge selection
    }, []);

    const handleNodeDoubleClick = useCallback((_, node) => {
        setSelectedNode(node);
        setSelectedEdge(null); // Clear edge selection
    }, []);

    // Handle edge selection
    const handleEdgeClick = useCallback((_, edge) => {
        setSelectedEdge(edge);
        setSelectedNode(null); // Clear node selection
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

    // Update selected edge when edges change
    useEffect(() => {
        if (selectedEdge) {
            const updatedEdge = edges.find(e => e.id === selectedEdge.id);
            if (updatedEdge) {
                setSelectedEdge(updatedEdge);
            }
        }
    }, [edges, selectedEdge]);

    const handleUpdateEdge = useCallback((id, newData) => {
        setEdges((eds) =>
            eds.map((edge) => {
                if (edge.id === id) {
                    return { ...edge, ...newData };
                }
                return edge;
            })
        );
    }, [setEdges]);

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
                const selectedEdges = edges.filter((e) => e.selected);

                if (selectedNodes.length > 0) {
                    deleteElements({ nodes: selectedNodes });
                }
                if (selectedEdges.length > 0) {
                    deleteElements({ edges: selectedEdges });
                }
            }
        },
        [getNodes, edges, deleteElements]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const onNodeDragStop = useCallback(
        (event, node) => {
            // Check if the node is dropped on a group
            const intersectingNodes = getNodes().filter(
                (n) =>
                    n.id !== node.id &&
                    n.type === 'subflow' &&
                    node.position.x >= n.position.x &&
                    node.position.x <= n.position.x + n.measured.width || "inherit" &&
                    node.position.y >= n.position.y &&
                    node.position.y <= n.position.y + n.measured.height || "inherit"
            );

            if (intersectingNodes.length > 0) {
                const groupNode = intersectingNodes[0]; // Take the first intersecting group

                // If node is not already a child of this group
                if (node.parentId !== groupNode.id) {
                    setGroupPopupState({ show: true, node, group: groupNode });
                }
            }
        },
        [getNodes]
    );

    const handleAddToGroup = useCallback(() => {
        const { node, group } = groupPopupState;
        if (!node || !group) return;

        const relativePosition = {
            x: node.position.x - group.position.x,
            y: node.position.y - group.position.y,
        };

        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        parentId: group.id,
                        extent: 'parent',
                        position: relativePosition,
                    };
                }
                return n;
            })
        );

        setGroupPopupState({ show: false, node: null, group: null });
    }, [groupPopupState, setNodes]);

    const handleCancelGroup = useCallback(() => {
        setGroupPopupState({ show: false, node: null, group: null });
    }, []);

    const handleGeminiClick = useCallback(() => {
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            alert("Please save your Gemini API Key in Settings first.");
            setShowSettings(true);
            return;
        }
        setShowGeminiModal(true);
    }, []);

    const handleGenerateFlow = useCallback(async (prompt) => {
        const apiKey = localStorage.getItem('gemini_api_key');
        try {
            const currentNodes = getNodes();
            // Filter out circular references or huge data if needed, but basic nodes are fine
            const flowData = await generateFlow(prompt, currentNodes, edges, apiKey);

            if (flowData.nodes) {
                setNodes((nds) => {
                    const nodeMap = new Map(nds.map((n) => [n.id, n]));
                    flowData.nodes.forEach((n) => nodeMap.set(n.id, n));
                    return Array.from(nodeMap.values());
                });
            }
            if (flowData.edges) {
                setEdges((eds) => {
                    const edgeMap = new Map(eds.map((e) => [e.id, e]));
                    flowData.edges.forEach((e) => edgeMap.set(e.id, e));
                    return Array.from(edgeMap.values());
                });
            }
        } catch (error) {
            console.error("Flow generation failed:", error);
            throw error; // Re-throw to be caught by the modal
        }
    }, [getNodes, edges, setNodes, setEdges]);

    return (
        <div style={{ width: "100%", height: "100vh", touchAction: "none", overscrollBehavior: "none" }} ref={reactFlowWrapper}>
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
                onEdgeClick={handleEdgeClick}
                onNodesDelete={onNodesDelete}
                fitView
                minZoom={0.06}
                deleteKeyCode="Delete"
                panOnDrag={!isSelectionMode}
                selectionOnDrag={isSelectionMode}
                onNodeDragStop={onNodeDragStop}
            >
                <Sidebar
                    onAddNode={handleAddNode}
                    onGroupNodes={handleGroupNodes}
                    onSaveFlow={handleSaveFlow}
                    onBrowseExamples={handleBrowseExamples}
                    onUploadFromDisk={handleUploadFromDisk}
                    isSelectionMode={isSelectionMode}
                    onToggleSelectionMode={toggleSelectionMode}
                    onSettings={() => setShowSettings(true)}
                    onGeminiAI={handleGeminiClick}
                />
                <Background />
                <Controls />
                <MiniMap />
                <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
                    <PropertySidebar
                        node={selectedNode}
                        edge={selectedEdge}
                        onClose={() => {
                            setSelectedNode(null);
                            setSelectedEdge(null);
                        }}
                        onUpdate={handleUpdateNode}
                        onUpdateEdge={handleUpdateEdge}
                        onDelete={(id) => deleteElements({ nodes: [{ id }] })}
                        onDeleteEdge={(id) => deleteElements({ edges: [{ id }] })}
                    />
                </div>
                {groupPopupState.show && (
                    <GroupActionPopup
                        onConfirm={handleAddToGroup}
                        onCancel={handleCancelGroup}
                    />
                )}
                {showSettings && (
                    <SettingsModal onClose={() => setShowSettings(false)} />
                )}
                {showGeminiModal && (
                    <GeminiPromptModal
                        onClose={() => setShowGeminiModal(false)}
                        onGenerate={handleGenerateFlow}
                    />
                )}
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
