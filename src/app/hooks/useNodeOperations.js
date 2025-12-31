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
        (type = 'textNode', positionOverride = null) => {
            const wrapper = reactFlowWrapper.current;
            const instance = reactFlowInstance.current;
            if (!wrapper || !instance) return;

            let position;
            if (positionOverride) {
                position = positionOverride;
            } else {
                const rect = wrapper.getBoundingClientRect();
                position = generateRandomPosition(rect, instance);
            }
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
     * Groups selected nodes into a groupNode
     */
    const handleGroupNodes = useCallback(() => {
        if (!reactFlowInstance.current) return;

        const selected = reactFlowInstance.current.getNodes().filter((n) => n.selected);
        if (selected.length < 2) {
            alert('Select at least 2 nodes');
            return;
        }

        const selectedIds = new Set(selected.map((n) => n.id));

        // Filter for "top-level" nodes in the selection:
        // Nodes whose parent is NOT also in the selected set.
        // This prevents double-reparenting children of selected groups.
        const nodesToReparent = selected.filter((n) => !n.parentId || !selectedIds.has(n.parentId));

        if (nodesToReparent.length === 0) {
            // Should not happen if selected.length >= 2, but safety check
            return;
        }

        // Check if all top-level nodes share the same parent
        // If so, the new group will be a child of that parent (nested group)
        const commonParentId = nodesToReparent[0].parentId;
        const allHaveSameParent = nodesToReparent.every((n) => n.parentId === commonParentId);
        const parentId = allHaveSameParent ? commonParentId : undefined;

        // Calculate bounds based ONLY on the top-level nodes we are grouping
        const { position, width, height } = calculateGroupBounds(nodesToReparent);
        const groupId = `groupNode-${Date.now()}`;
        const color = generateRandomColor();

        const groupNode = {
            id: groupId,
            type: 'groupNode',
            position,
            data: { label: '', width, height, color },
            style: { width, height },
            draggable: true,
            selectable: true,
            width,
            height,
            parentId,
            extent: parentId ? 'parent' : undefined,
        };

        // Reparent only the top-level nodes
        const children = nodesToReparent.map((n) => ({
            ...n,
            parentId: groupId,
            extent: 'parent',
            position: { x: n.position.x - position.x, y: n.position.y - position.y },
        }));

        const nodesToReparentIds = new Set(nodesToReparent.map(n => n.id));

        setNodes((nds) => {
            // Helper to recursively find all descendants of a set of parent IDs
            const getDescendants = (nodes, parentIds) => {
                let descendants = [];
                const children = nodes.filter(n => parentIds.has(n.parentId));
                if (children.length > 0) {
                    descendants = [...children];
                    const childIds = new Set(children.map(n => n.id));
                    descendants = [...descendants, ...getDescendants(nodes, childIds)];
                }
                return descendants;
            };

            // 1. Identify all nodes that are NOT being directly reparented (candidates for remaining or moving)
            const otherNodes = nds.filter((n) => !nodesToReparentIds.has(n.id));

            // 2. Find all descendants of the nodes we are reparenting
            // These need to be moved to the end of the array to render on top of the new group
            const descendants = getDescendants(otherNodes, nodesToReparentIds);
            const descendantIds = new Set(descendants.map(n => n.id));

            // 3. Filter out descendants from the "other" list to avoid duplicates
            const remainingNodes = otherNodes.filter(n => !descendantIds.has(n.id));

            return [
                ...remainingNodes,
                groupNode,
                ...children,
                ...descendants // Render descendants last (on top)
            ];
        });
    }, [reactFlowInstance, setNodes]);

    /**
     * Updates node properties
     */
    const handleUpdateNode = useCallback(
        (id, newData) => {
            setNodes((nds) => {
                return nds.map((n) => {
                    if (n.id === id) {
                        // Separate top-level properties from data properties
                        const topLevelProps = {};
                        const dataProps = {};

                        Object.keys(newData).forEach(key => {
                            if (key === 'parentId' || key === 'extent' || key === 'type') {
                                topLevelProps[key] = newData[key];
                            } else {
                                dataProps[key] = newData[key];
                            }
                        });

                        // If parentId is being cleared, remove extent as well
                        if (topLevelProps.parentId === null) {
                            topLevelProps.parentId = undefined;
                            topLevelProps.extent = undefined;
                        } else if (topLevelProps.parentId) {
                            topLevelProps.extent = 'parent';
                        }

                        return {
                            ...n,
                            ...topLevelProps,
                            data: { ...n.data, ...dataProps }
                        };
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
