/**
 * Custom hook for node operations in FlowCanvas
 */
import { useCallback } from 'react';
import { addEdge } from '@xyflow/react';
import { generateRandomColor } from '../utils/colorUtils';
import { generateNodeId, generateRandomPosition, calculateGroupBounds } from '../utils/nodeUtils';

export const useNodeOperations = ({
    reactFlowWrapper,
    reactFlowInstance,
    nodeIdRef,
    setNodes,
    setEdges,
    selectedNode,
}) => {
    /**
     * Adds a new node to the canvas
     */
    const handleAddNode = useCallback(
        (type = 'textNode') => {
            const wrapper = reactFlowWrapper.current;
            const instance = reactFlowInstance.current;
            if (!wrapper || !instance) return;

            const rect = wrapper.getBoundingClientRect();
            const position = generateRandomPosition(rect, instance);
            const newId = generateNodeId(nodeIdRef);

            const newNode = {
                id: newId,
                type,
                position,
                data: { label: `Node ${newId}` },
            };

            // Configure node based on type
            if (type === 'imageNode') {
                newNode.data.src = 'https://picsum.photos/100';
            } else if (type === 'notesNode') {
                newNode.data.color = generateRandomColor();
                newNode.data.label = 'New Note';

                // Connect to selected node if exists
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
        [reactFlowWrapper, reactFlowInstance, nodeIdRef, setNodes, setEdges, selectedNode]
    );

    /**
     * Groups selected nodes into a subflow
     */
    const handleGroupNodes = useCallback(() => {
        if (!reactFlowInstance.current) return;

        const selected = reactFlowInstance.current.getNodes().filter((n) => n.selected);
        if (selected.length < 2) {
            alert('Select at least 2 nodes');
            return;
        }

        const { position, width, height } = calculateGroupBounds(selected);
        const subflowId = `subflow-${Date.now()}`;
        const color = generateRandomColor();

        const subflowNode = {
            id: subflowId,
            type: 'subflow',
            position,
            data: { label: '', width, height, color },
            draggable: true,
            selectable: true,
            width,
            height,
        };

        const children = selected.map((n) => ({
            ...n,
            parentId: subflowId,
            extent: 'parent',
            position: { x: n.position.x - position.x, y: n.position.y - position.y },
        }));

        setNodes((nds) => [...nds.filter((n) => !n.selected), subflowNode, ...children]);
    }, [reactFlowInstance, setNodes]);

    /**
     * Updates node properties
     */
    const handleUpdateNode = useCallback(
        (id, newData) => {
            setNodes((nds) => {
                return nds.map((n) => {
                    if (n.id === id) {
                        return { ...n, data: { ...n.data, ...newData } };
                    }
                    return n;
                });
            });
        },
        [setNodes]
    );

    return {
        handleAddNode,
        handleGroupNodes,
        handleUpdateNode,
    };
};
