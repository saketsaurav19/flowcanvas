/**
 * Custom hook for file operations in FlowCanvas
 */
import { useCallback, useState } from 'react';
import { downloadFlowAsJson, readJsonFile, fetchFlowFromPublic, migrateNodes } from '../utils/fileUtils';
import { updateNodeIdCounter } from '../utils/nodeUtils';

export const useFileOperations = ({
    reactFlowInstance,
    nodeIdRef,
    setNodes,
    setEdges,
}) => {
    const [openedFileName, setOpenedFileName] = useState(null);
    const [showFileOverlay, setShowFileOverlay] = useState(false);
    const [fileList, setFileList] = useState([]);

    /**
     * Loads a flow into the canvas
     */
    const handleLoadFlow = useCallback(
        (flow, fileName = null) => {
            if (!flow) return;

            const migratedNodes = migrateNodes(flow.nodes);
            setNodes(migratedNodes || []);
            setEdges(flow.edges || []);
            reactFlowInstance.current?.setViewport(flow.viewport || { x: 0, y: 0, zoom: 1 });
            reactFlowInstance.current?.fitView();

            // Update the nodeId ref to avoid collisions
            updateNodeIdCounter(flow.nodes, nodeIdRef);
            setOpenedFileName(fileName);
        },
        [reactFlowInstance, nodeIdRef, setNodes, setEdges]
    );

    /**
     * Saves the current flow to disk
     */
    const handleSaveFlow = useCallback(() => {
        if (!reactFlowInstance.current) return;

        const flow = reactFlowInstance.current.toObject();
        let fileName = openedFileName;

        if (!fileName) {
            fileName = prompt('Enter a name for your flow:');
            if (!fileName) return;
        }

        downloadFlowAsJson(flow, fileName);
        setOpenedFileName(fileName);
        alert('Flow downloaded successfully!');
    }, [reactFlowInstance, openedFileName]);

    /**
     * Opens the file browser overlay
     */
    const handleBrowseExamples = useCallback(() => {
        const exampleFiles = ['English.json'];
        setFileList(exampleFiles);
        setShowFileOverlay(true);
    }, []);

    /**
     * Loads a file from the examples
     */
    const handleFileSelect = useCallback(
        async (fileName) => {
            try {
                const flow = await fetchFlowFromPublic(fileName);
                handleLoadFlow(flow, fileName);
                setShowFileOverlay(false);
            } catch (error) {
                console.error('Error loading flow:', error);
                alert('An unexpected error occurred while loading the flow.');
            }
        },
        [handleLoadFlow]
    );

    /**
     * Uploads a flow from disk
     */
    const handleUploadFromDisk = useCallback(
        async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            try {
                const flow = await readJsonFile(file);
                handleLoadFlow(flow, file.name.replace('.json', ''));
            } catch (error) {
                console.error('Error parsing JSON:', error);
                alert('Invalid JSON file. Please select a valid flow file.');
            }
        },
        [handleLoadFlow]
    );

    /**
     * Closes the file overlay
     */
    const handleCloseOverlay = useCallback(() => {
        setShowFileOverlay(false);
    }, []);

    return {
        openedFileName,
        showFileOverlay,
        fileList,
        handleLoadFlow,
        handleSaveFlow,
        handleBrowseExamples,
        handleFileSelect,
        handleUploadFromDisk,
        handleCloseOverlay,
    };
};
