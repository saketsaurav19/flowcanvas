import ELK from 'elkjs/lib/elk.bundled';

const elk = new ELK();

// Elk layout options
const defaultOptions = {
    'elk.algorithm': 'layered',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '80',
    'elk.direction': 'DOWN', // DOWN, RIGHT, UP, LEFT
};

export const getLayoutedElements = async (nodes, edges, options = {}) => {
    const layoutOptions = { ...defaultOptions, ...options };

    // Create a map of nodes for easy lookup
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));

    // Filter edges to ensure source and target nodes exist
    const validEdges = edges.filter(edge => nodeMap.has(edge.source) && nodeMap.has(edge.target));

    // Build the hierarchy for Elk
    // Elk expects a graph where children are nested inside parents
    const graph = {
        id: 'root',
        layoutOptions: layoutOptions,
        children: [],
        edges: validEdges.map((edge) => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target],
        })),
    };

    // Helper to find or create a parent node in the graph structure
    // Since React Flow is flat, we need to reconstruct the tree
    const buildHierarchy = () => {
        const hierarchy = [];
        const idToNode = {};

        // 1. Create Elk node objects for all nodes
        nodes.forEach((node) => {
            const isGroup = node.type === 'groupNode';
            const width = Number(node.measured?.width || node.width || 150);
            const height = Number(node.measured?.height || node.height || 50);

            const elkNode = {
                id: node.id,
                width: isNaN(width) ? 150 : width,
                height: isNaN(height) ? 50 : height,
                // Pass existing position as a hint if needed, but usually we want Elk to decide
                // x: node.position.x, 
                // y: node.position.y,
                children: [],
                layoutOptions: {
                    // Specific options for different node types if needed
                    'elk.padding': '[top=50,left=50,bottom=50,right=50]', // Padding for group nodes
                    ...(isGroup && {
                        'elk.direction': 'DOWN',
                        'elk.algorithm': 'layered',
                        'elk.spacing.nodeNode': '50',
                    })
                }
            };
            idToNode[node.id] = elkNode;
        });

        // 2. Assign children to parents
        nodes.forEach((node) => {
            const elkNode = idToNode[node.id];
            if (node.parentId && idToNode[node.parentId]) {
                idToNode[node.parentId].children.push(elkNode);
            } else {
                hierarchy.push(elkNode);
            }
        });

        return hierarchy;
    };

    graph.children = buildHierarchy();

    try {
        // Run the layout
        const layoutedGraph = await elk.layout(graph);
        // Flatten the result back to React Flow format
        const layoutedNodes = [];

        const flatten = (element, parentX = 0, parentY = 0) => {
            if (element.children) {
                element.children.forEach((child) => {
                    if (!child) {
                        console.warn("Elk returned undefined child");
                        return;
                    }

                    // Elk returns relative coordinates for children
                    // React Flow also expects relative coordinates for children of GroupNodes
                    // BUT: If we are not using GroupNodes in React Flow (just visual grouping), we might need absolute.
                    // In this project, we ARE using parentId, so relative positions are correct.

                    const originalNode = nodeMap.get(child.id);
                    if (!originalNode) {
                        console.warn("Original node not found for ID:", child.id);
                        return;
                    }

                    const isGroup = originalNode.type === 'groupNode' || (child.children && child.children.length > 0);

                    const newNode = {
                        ...originalNode,
                        position: { x: child.x || 0, y: child.y || 0 },
                    };

                    // Only set width/height for group nodes, let others auto-size
                    if (isGroup) {
                        newNode.style = {
                            ...originalNode.style,
                            width: child.width,
                            height: child.height
                        };
                    }

                    layoutedNodes.push(newNode);

                    flatten(child, parentX + (child.x || 0), parentY + (child.y || 0));
                });
            }
        };

        // Process top-level nodes
        layoutedGraph.children.forEach((child) => {
            if (!child) return;
            const originalNode = nodeMap.get(child.id);
            if (!originalNode) return;

            const isGroup = originalNode.type === 'groupNode' || (child.children && child.children.length > 0);

            const newNode = {
                ...originalNode,
                position: { x: child.x || 0, y: child.y || 0 },
            };

            // Only set width/height for group nodes
            if (isGroup) {
                newNode.style = {
                    ...originalNode.style,
                    width: child.width,
                    height: child.height
                };
            }

            layoutedNodes.push(newNode);
            flatten(child, child.x || 0, child.y || 0);
        });

        // Post-process: Adjust group node dimensions to fit children
        // Elk sometimes gives generous or fixed sizes, but we want it to fit tightly around children
        layoutedNodes.forEach(node => {
            if (node.type === 'groupNode') {
                const children = layoutedNodes.filter(n => n.parentId === node.id);
                if (children.length > 0) {
                    let minX = Infinity;
                    let minY = Infinity;
                    let maxX = -Infinity;
                    let maxY = -Infinity;

                    children.forEach(child => {
                        const childX = child.position?.x || 0;
                        const childY = child.position?.y || 0;
                        const childWidth = child.measured?.width || child.width || 150;
                        const childHeight = child.measured?.height || child.height || 50;

                        if (childX < minX) minX = childX;
                        if (childY < minY) minY = childY;
                        if (childX + childWidth > maxX) maxX = childX + childWidth;
                        if (childY + childHeight > maxY) maxY = childY + childHeight;
                    });

                    // Add padding
                    const padding = 50;
                    const newWidth = (maxX - minX) + (padding * 2);
                    const newHeight = (maxY - minY) + (padding * 2);

                    // Update group style
                    node.style = {
                        ...node.style,
                        width: newWidth,
                        height: newHeight,
                    };

                    // Adjust children positions to be relative to the new group origin (which includes padding)
                    // Actually, Elk already positions children relative to the group's content box.
                    // If we change the group size, we might need to shift children if the origin changes.
                    // But here we are just expanding the box. 
                    // Let's assume Elk's (0,0) for children is the top-left of the content area.
                    // If we add padding, we might need to offset children.

                    // Simpler approach: Trust Elk's layout but ensure the group is at least big enough.
                    // Elk usually handles this if 'elk.hierarchyHandling' is 'INCLUDE_CHILDREN'.
                    // But if we want to force it:

                    // Let's just ensure the width/height covers the children + padding.
                    // We won't change positions for now, assuming Elk placed them reasonably.
                    node.style.width = Math.max(node.style.width || 0, newWidth);
                    node.style.height = Math.max(node.style.height || 0, newHeight);
                }
            }
        });

        return { nodes: layoutedNodes, edges };
    } catch (error) {
        console.error('Elk layout failed:', error);
        return { nodes, edges }; // Return original if failed
    }
};
