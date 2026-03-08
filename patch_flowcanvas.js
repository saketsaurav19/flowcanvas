const fs = require('fs');

const flowcanvasFile = 'src/app/components/FlowCanvas.js';
let content = fs.readFileSync(flowcanvasFile, 'utf8');

// We need to change the handleGenerateFlow logic slightly.
// Right now it sets nodes/edges, waits 500ms, then calls handleAutoLayout() which reads from getNodes().
// This is somewhat brittle because it depends on React render cycles.
// We can directly pass newNodes and newEdges to handleAutoLayout.

let handleGenerateFlowRegex = /const handleGenerateFlow = useCallback\(async \(prompt, model, abortSignal\) => \{[\s\S]*?\} catch \(error\) \{[\s\S]*?throw error;\s*\}\s*\}, \[getNodes, edges, setNodes, setEdges, handleAutoLayout\]\);/;

let newHandleGenerateFlow = `const handleGenerateFlow = useCallback(async (prompt, model, abortSignal) => {
        const apiKey = localStorage.getItem('gemini_api_key');
        try {
            const currentNodes = getNodes();
            const flowData = await generateFlow(prompt, currentNodes, edges, apiKey, model, abortSignal);

            console.log("Flow Data:", flowData);

            let newNodes = [];
            let newEdges = [];

            if (flowData.nodes) {
                const nodeMap = new Map(currentNodes.map((n) => [n.id, n]));
                flowData.nodes.forEach((n) => {
                    // Ensure position exists for auto-layout fallback
                    if (!n.position) n.position = { x: 0, y: 0 };
                    nodeMap.set(n.id, n);
                });
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

            // Immediately calculate layout before setting state to avoid visual jumps
            console.log("Applying auto-layout...");
            try {
                // Pass directly to layout function instead of waiting for render
                await handleAutoLayout(newNodes, newEdges);
                console.log("Auto-layout applied successfully.");
            } catch (layoutError) {
                console.error("Auto-layout failed in handleGenerateFlow:", layoutError);
                // Fallback: just set nodes if layout fails
                setNodes(newNodes);
                setEdges(newEdges);
            }
        } catch (error) {
            console.error("Flow generation failed:", error);
            throw error;
        }
    }, [getNodes, edges, setNodes, setEdges, handleAutoLayout]);`;

content = content.replace(handleGenerateFlowRegex, newHandleGenerateFlow);

fs.writeFileSync(flowcanvasFile, content);
