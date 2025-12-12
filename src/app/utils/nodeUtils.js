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
    const getNodeWidth = (n) => {
        if (n.measured && typeof n.measured.width === 'number') return n.measured.width;
        if (typeof n.width === 'number') return n.width;
        if (typeof n.width === 'string') return parseFloat(n.width);
        if (n.style && typeof n.style.width === 'number') return n.style.width;
        if (n.style && typeof n.style.width === 'string') return parseFloat(n.style.width);
        if (n.data && typeof n.data.width === 'number') return n.data.width;
        if (n.data && typeof n.data.width === 'string') return parseFloat(n.data.width);
        return 150;
    };

    const getNodeHeight = (n) => {
        if (n.measured && typeof n.measured.height === 'number') return n.measured.height;
        if (typeof n.height === 'number') return n.height;
        if (typeof n.height === 'string') return parseFloat(n.height);
        if (n.style && typeof n.style.height === 'number') return n.style.height;
        if (n.style && typeof n.style.height === 'string') return parseFloat(n.style.height);
        if (n.data && typeof n.data.height === 'number') return n.data.height;
        if (n.data && typeof n.data.height === 'string') return parseFloat(n.data.height);
        return 100;
    };

    const minX = Math.min(...selectedNodes.map((n) => n.position.x));
    const minY = Math.min(...selectedNodes.map((n) => n.position.y));
    const maxX = Math.max(...selectedNodes.map((n) => n.position.x + getNodeWidth(n)));
    const maxY = Math.max(...selectedNodes.map((n) => n.position.y + getNodeHeight(n)));

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
