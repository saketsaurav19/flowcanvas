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
import { getLayoutedElements } from "../utils/layoutUtils";
import { SettingsProvider } from "../context/SettingsContext";

import UndoRedoControls from "./UndoRedoControls";
import { useUndoRedo } from "../hooks/useUndoRedo";

const nodeTypes = {
    textNode: TextNode,
    imageNode: ImageNode,
    notesNode: NotesNode,
    groupNode: GroupNode,
};

const initialNodes = [];
const initialEdges = [];

const FlowCanvas = () => {
    const reactFlowWrapper = useRef(null);
    const reactFlowInstance = useRef(null);
    const { getNodes, getEdges, deleteElements } = useReactFlow();
    const nodeIdRef = useRef(1);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedEdge, setSelectedEdge] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [groupPopupState, setGroupPopupState] = useState({ show: false, node: null, group: null });
    const [showSettings, setShowSettings] = useState(false);
    const [showGeminiModal, setShowGeminiModal] = useState(false);
    const [shouldFitView, setShouldFitView] = useState(false);

    // Track if update is from undo/redo to prevent history loop
    const isUndoRedoOperation = useRef(false);

    const { takeSnapshot, debouncedTakeSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo(initialNodes, initialEdges);

    // Track mouse position for shortcuts
    const mousePosRef = useRef({ x: 0, y: 0 });

    // Track changes for undo/redo
    useEffect(() => {
        if (isUndoRedoOperation.current) {
            isUndoRedoOperation.current = false;
            return;
        }
        // Only snapshot if nodes or edges have content
        if (nodes.length > 0) {
            debouncedTakeSnapshot(nodes, edges);
        }
    }, [nodes, edges, debouncedTakeSnapshot]);

    const handleUndo = useCallback(() => {
        const previousState = undo();
        if (previousState) {
            isUndoRedoOperation.current = true;
            setNodes(previousState.nodes);
            setEdges(previousState.edges);
        }
    }, [undo, setNodes, setEdges]);

    const handleRedo = useCallback(() => {
        const nextState = redo();
        if (nextState) {
            isUndoRedoOperation.current = true;
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
        }
    }, [redo, setNodes, setEdges]);


    const handleMouseMove = useCallback((e) => {
        mousePosRef.current = { x: e.clientX, y: e.clientY };
    }, []);

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

    // Helper to get absolute position of a node
    const getNodeAbsolutePosition = useCallback((nodeId, currentNodes) => {
        const node = currentNodes.find(n => n.id === nodeId);
        if (!node) return { x: 0, y: 0 };

        let x = node.position.x;
        let y = node.position.y;
        let parentId = node.parentId;

        while (parentId) {
            const parent = currentNodes.find(n => n.id === parentId);
            if (parent) {
                x += parent.position.x;
                y += parent.position.y;
                parentId = parent.parentId;
            } else {
                break;
            }
        }

        return { x, y };
    }, []);

    const onNodeDragStop = useCallback(
        (event, node) => {
            const currentNodes = getNodes();
            const nodeAbsPos = getNodeAbsolutePosition(node.id, currentNodes);

            // Check if the node is dropped on a group
            const intersectingNodes = currentNodes.filter(
                (n) => {
                    if (n.id === node.id || n.type !== 'groupNode') return false;

                    const groupAbsPos = getNodeAbsolutePosition(n.id, currentNodes);
                    const width = n.measured?.width || n.width || 0;
                    const height = n.measured?.height || n.height || 0;

                    return (
                        nodeAbsPos.x >= groupAbsPos.x &&
                        nodeAbsPos.x <= groupAbsPos.x + width &&
                        nodeAbsPos.y >= groupAbsPos.y &&
                        nodeAbsPos.y <= groupAbsPos.y + height
                    );
                }
            );

            if (intersectingNodes.length > 0) {
                // Sort by size (area) ascending, so we drop into the smallest (most specific) group
                intersectingNodes.sort((a, b) => {
                    const aArea = (a.measured?.width || a.width || 0) * (a.measured?.height || a.height || 0);
                    const bArea = (b.measured?.width || b.width || 0) * (b.measured?.height || b.height || 0);
                    return aArea - bArea;
                });

                const groupNode = intersectingNodes[0]; // Take the smallest intersecting group

                // If node is not already a child of this group
                if (node.parentId !== groupNode.id) {
                    setGroupPopupState({ show: true, node, group: groupNode });
                }
            }
        },
        [getNodes, getNodeAbsolutePosition]
    );

    const handleAddToGroup = useCallback(() => {
        const { node, group } = groupPopupState;
        if (!node || !group) return;

        const currentNodes = getNodes();
        const nodeAbsPos = getNodeAbsolutePosition(node.id, currentNodes);
        const groupAbsPos = getNodeAbsolutePosition(group.id, currentNodes);

        const relativePosition = {
            x: nodeAbsPos.x - groupAbsPos.x,
            y: nodeAbsPos.y - groupAbsPos.y,
        };

        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        parentId: group.id,
                        extent: 'parent',
                        position: relativePosition,
                        // Ensure data is preserved but parentId updated
                        data: { ...n.data },
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

    const handleAutoLayout = useCallback(async (overrideNodes, overrideEdges) => {
        // Check if overrideNodes is an event object or not an array
        const isEvent = overrideNodes && overrideNodes.preventDefault;

        // Use provided overrides, or fall back to current state from getNodes() to ensure we have measured dimensions
        const nodesToLayout = (Array.isArray(overrideNodes) && !isEvent) ? overrideNodes : getNodes();
        const edgesToLayout = (Array.isArray(overrideEdges) && !isEvent) ? overrideEdges : getEdges();

        const layouted = await getLayoutedElements(nodesToLayout, edgesToLayout, { 'elk.algorithm': 'layered', 'elk.direction': 'DOWN' });

        setNodes([...layouted.nodes]);
        console.log("Layouted Nodes:", layouted.nodes);
        setEdges([...layouted.edges]);
        console.log("Layouted Edges:", layouted.edges);

        setShouldFitView(true);
    }, [getNodes, getEdges, setNodes, setEdges]);

    useEffect(() => {
        if (shouldFitView && reactFlowInstance.current) {
            window.requestAnimationFrame(() => {
                reactFlowInstance.current.fitView();
            });
            setShouldFitView(false);
            console.log("Fit View triggered via useEffect");
        }
    }, [shouldFitView]);

    const handleGenerateFlow = useCallback(async (prompt, model, abortSignal) => {
        const apiKey = localStorage.getItem('gemini_api_key');
        try {
            const currentNodes = getNodes();
            // Filter out circular references or huge data if needed, but basic nodes are fine
            const flowData = await generateFlow(prompt, currentNodes, edges, apiKey, model, abortSignal);

            console.log("Flow Data:", flowData);

            let newNodes = [];
            let newEdges = [];

            if (flowData.nodes) {
                const nodeMap = new Map(currentNodes.map((n) => [n.id, n]));
                flowData.nodes.forEach((n) => nodeMap.set(n.id, n));
                newNodes = Array.from(nodeMap.values());
            } else {
                newNodes = currentNodes;
            }

            if (flowData.edges) {
                const edgeMap = new Map(edges.map((e) => [e.id, e]));
                flowData.edges.forEach((e) => edgeMap.set(e.id, e));
                newEdges = Array.from(edgeMap.values());
            } else {
                newEdges = edges;
            }

            // First set the nodes and edges to allow React Flow to render them
            // This ensures that 'measured' dimensions are available for the layout engine
            setNodes(newNodes);
            setEdges(newEdges);

            // Wait for a render cycle (using setTimeout) before applying layout
            console.log("Waiting for render before auto-layout...");
            setTimeout(async () => {
                console.log("Applying auto-layout...");
                try {
                    // Call without arguments to use the current state (which should be updated by now)
                    await handleAutoLayout();
                    console.log("Auto-layout applied successfully.");
                } catch (layoutError) {
                    console.error("Auto-layout failed in handleGenerateFlow:", layoutError);
                }
            }, 500);
        } catch (error) {
            console.error("Flow generation failed:", error);
            throw error; // Re-throw to be caught by the modal
        }
    }, [getNodes, edges, setNodes, setEdges, handleAutoLayout]);



    // Handle keyboard shortcuts
    const handleKeyDown = useCallback(
        (event) => {
            // Helper to get flow position from mouse position
            const getFlowPosition = () => {
                if (reactFlowInstance.current) {
                    return reactFlowInstance.current.screenToFlowPosition({
                        x: mousePosRef.current.x,
                        y: mousePosRef.current.y
                    });
                }
                return null;
            };

            // Universal Shortcuts (Ctrl/Cmd)
            if (event.ctrlKey || event.metaKey) {
                switch (event.key.toLowerCase()) {
                    case 'z':
                        event.preventDefault();
                        if (event.shiftKey) {
                            handleRedo();
                        } else {
                            handleUndo();
                        }
                        break;
                    case 'y':
                        event.preventDefault();
                        handleRedo();
                        break;
                    case 's':
                        event.preventDefault();
                        handleSaveFlow();
                        break;
                    case 'o':
                        event.preventDefault();
                        document.querySelector('input[type="file"][accept=".json"]')?.click();
                        break;
                    default:
                        break;
                }
            }

            // Shift Shortcuts
            if (event.shiftKey) {
                switch (event.key.toLowerCase()) {
                    case 't': // Add Text Node
                        handleAddNode('textNode', getFlowPosition());
                        break;
                    case 'i': // Add Image Node
                        handleAddNode('imageNode', getFlowPosition());
                        break;
                    case 'n': // Add Notes Node
                        handleAddNode('notesNode', getFlowPosition());
                        break;
                    case 'g': // Group Nodes
                        const selectedNodes = getNodes().filter(n => n.selected);
                        if (selectedNodes.length === 1) {
                            handleUpdateNode(selectedNodes[0].id, { type: 'groupNode' });
                        } else {
                            handleGroupNodes();
                        }
                        break;
                    case 'v': // Toggle Selection Mode
                        toggleSelectionMode();
                        break;
                    case 'l': // Auto Layout
                        handleAutoLayout();
                        break;
                    case 'b': // Browse Examples
                        handleBrowseExamples();
                        break;
                    case 'a': // Gemini AI
                        handleGeminiClick();
                        break;
                    case '<': // Settings (using < for comma as shift+, is <)
                    case ',': // Just in case
                        setShowSettings(true);
                        break;
                    default:
                        break;
                }
            }

            // Delete key
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
        [
            getNodes,
            edges,
            deleteElements,
            handleAddNode,
            handleGroupNodes,
            handleUpdateNode,
            handleSaveFlow,
            handleBrowseExamples,
            toggleSelectionMode,
            handleAutoLayout,
            handleGeminiClick
        ]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);


    return (
        <div
            style={{ width: "100%", height: "100vh", touchAction: "none", overscrollBehavior: "none" }}
            ref={reactFlowWrapper}
            onMouseMove={handleMouseMove}
        >
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
                <div style={{ position: "absolute", top: 10, right: 50, zIndex: 10 }}>
                    <UndoRedoControls
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                    />
                </div>
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
                    onLayout={handleAutoLayout}
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

const FlowCanvasWithProvider = () => (
    <SettingsProvider>
        <FlowCanvas />
    </SettingsProvider>
);

export default FlowCanvasWithProvider;
