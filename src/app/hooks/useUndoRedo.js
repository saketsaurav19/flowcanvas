import { useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

export const useUndoRedo = (initialNodes = [], initialEdges = []) => {
    // History stacks
    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);

    // We need to keep track of the current state internally to push to past when a new change happens
    const historyRef = useRef({
        past: [],
        future: [],
        present: { nodes: initialNodes, edges: initialEdges }
    });

    // Helper to deeply copy state
    const cloneState = (nodes, edges) => ({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges))
    });

    // Function to take a snapshot of the current state
    // This should be called whenever nodes or edges change due to USER INTERACTION
    const takeSnapshot = useCallback((nodes, edges) => {
        const currentPresent = historyRef.current.present;

        // Avoid duplicate snapshots if state hasn't effectively changed
        if (JSON.stringify(currentPresent.nodes) === JSON.stringify(nodes) &&
            JSON.stringify(currentPresent.edges) === JSON.stringify(edges)) {
            return;
        }

        const newPast = [...historyRef.current.past, currentPresent];

        // Limit history size (e.g., 50 steps)
        if (newPast.length > 50) {
            newPast.shift();
        }

        historyRef.current = {
            past: newPast,
            future: [], // Clear future on new change
            present: cloneState(nodes, edges)
        };

        setPast(newPast);
        setFuture([]);
    }, []);

    // Debounced snapshot to avoid capturing every micro-movement during drag
    const debouncedTakeSnapshot = useCallback(
        debounce((nodes, edges) => {
            takeSnapshot(nodes, edges);
        }, 500),
        [takeSnapshot]
    );

    const undo = useCallback((currentNodes, currentEdges) => {
        if (historyRef.current.past.length === 0) return null;

        const previous = historyRef.current.past[historyRef.current.past.length - 1];
        const newPast = historyRef.current.past.slice(0, -1);

        const newFuture = [historyRef.current.present, ...historyRef.current.future];

        historyRef.current = {
            past: newPast,
            future: newFuture,
            present: previous // The state we are reverting TO
        };

        setPast(newPast);
        setFuture(newFuture);

        return previous;
    }, []);

    const redo = useCallback((currentNodes, currentEdges) => {
        if (historyRef.current.future.length === 0) return null;

        const next = historyRef.current.future[0];
        const newFuture = historyRef.current.future.slice(1);

        const newPast = [...historyRef.current.past, historyRef.current.present];

        historyRef.current = {
            past: newPast,
            future: newFuture,
            present: next // The state we are advancing TO
        };

        setPast(newPast);
        setFuture(newFuture);

        return next;
    }, []);

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    return {
        takeSnapshot,
        debouncedTakeSnapshot,
        undo,
        redo,
        canUndo,
        canRedo,
        history: historyRef.current // For debugging if needed
    };
};
