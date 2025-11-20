/**
 * Node utility functions for FlowCanvas
 */

/**
 * Generates a unique node ID
 * @param {Object} nodeIdRef - Reference object containing current node ID counter
 * @returns {string} Unique node ID
 */
export const generateNodeId = (nodeIdRef) => {
    return `dndnode_${nodeIdRef.current++}`;
};

/**
 * Generates a random position within the visible canvas area
 * @param {DOMRect} rect - Bounding rectangle of the canvas wrapper
 * @param {Object} reactFlowInstance - React Flow instance
 * @returns {Object} Position object with x and y coordinates
 */
export const generateRandomPosition = (rect, reactFlowInstance) => {
    // Generate a random position in DOM space (within the visible wrapper)
    const domX = 50 + Math.random() * (rect.width - 150);
    const domY = 50 + Math.random() * (rect.height - 150);

    // Convert DOM coordinates → Flow coordinates
    return reactFlowInstance.screenToFlowPosition({
        x: domX,
        y: domY,
    });
};

/**
 * Calculates bounding box for selected nodes
 * @param {Array} selectedNodes - Array of selected nodes
 * @param {number} padding - Padding around the group
 * @returns {Object} Bounding box with position, width, and height
 */
export const calculateGroupBounds = (selectedNodes, padding = 30) => {
    const minX = Math.min(...selectedNodes.map((n) => n.position.x));
    const minY = Math.min(...selectedNodes.map((n) => n.position.y));
    const maxX = Math.max(...selectedNodes.map((n) => n.position.x + (n.width || 150)));
    const maxY = Math.max(...selectedNodes.map((n) => n.position.y + (n.height || 100)));

    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    const position = { x: minX - padding, y: minY - padding };

    return { position, width, height };
};

/**
 * Updates node ID counter based on existing nodes
 * @param {Array} nodes - Array of existing nodes
 * @param {Object} nodeIdRef - Reference object containing current node ID counter
 */
export const updateNodeIdCounter = (nodes, nodeIdRef) => {
    let maxId = 0;
    nodes.forEach(node => {
        if (node.id.startsWith('dndnode_')) {
            const idNum = parseInt(node.id.split('_')[1], 10);
            if (idNum > maxId) {
                maxId = idNum;
            }
        }
    });
    nodeIdRef.current = maxId + 1;
};
