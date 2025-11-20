/**
 * File utility functions for FlowCanvas
 */

/**
 * Downloads a flow as a JSON file
 * @param {Object} flow - Flow object to save
 * @param {string} fileName - Name of the file (without extension)
 */
export const downloadFlowAsJson = (flow, fileName) => {
    // Remove .json extension if it exists
    let cleanFileName = fileName;
    if (fileName.endsWith('.json')) {
        cleanFileName = fileName.slice(0, -5);
    }

    // Add .json extension
    const fullFileName = `${cleanFileName}.json`;

    // Create blob and download
    const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fullFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Reads a JSON file from disk
 * @param {File} file - File object to read
 * @returns {Promise<Object>} Parsed JSON object
 */
export const readJsonFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
    });
};

/**
 * Fetches a flow from a public URL
 * @param {string} fileName - Name of the file to fetch
 * @returns {Promise<Object>} Parsed flow object
 */
export const fetchFlowFromPublic = async (fileName) => {
    const response = await fetch(`/uploads/${fileName}`);
    if (!response.ok) {
        throw new Error('Failed to fetch flow');
    }
    return await response.json();
};

/**
 * Migrates old node types to new ones
 * @param {Array} nodes - Array of nodes to migrate
 * @returns {Array} Migrated nodes
 */
export const migrateNodes = (nodes) => {
    return nodes.map(node => {
        if (node.type === 'coloredNode') {
            return { ...node, type: 'textNode' };
        }
        return node;
    });
};
