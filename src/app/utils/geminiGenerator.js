import { GoogleGenAI } from "@google/genai";

export const generateFlow = async (topic, currentNodes, currentEdges, apiKey) => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const context = `
You are an expert system architect and flowchart designer.
Your task is to generate a flowchart for the topic: "${topic}".
You must return ONLY a valid JSON object containing 'nodes' and 'edges'. Do not include markdown formatting or any other text.

The current flow has the following nodes:
${JSON.stringify(currentNodes.map(n => ({ id: n.id, label: n.data.label, type: n.type })))}

And the following edges:
${JSON.stringify(currentEdges.map(e => ({ id: e.id, source: e.source, target: e.target, label: e.label || "" })))}

INSTRUCTIONS:
1. Create new nodes and edges to represent the requested flow.
2. If the new flow relates to existing nodes, connect them appropriately.
3. Use unique IDs for new nodes (e.g., "gen-1", "gen-2").
4. Position the new nodes intelligently:
   - **Hierarchy**: Organize nodes in a clear TOP-DOWN structure. The starting node should be at the top.
   - **Vertical Spacing**: Maintain a minimum vertical gap of **100px** between each level of the hierarchy.
   - **Horizontal Spacing**: Maintain a minimum horizontal gap of **500px** between nodes at the same hierarchical level.
   - **Alignment**: Ensure nodes at the same hierarchical level are aligned horizontally.
   - If there are existing nodes, place the new ones below or to the side to avoid overlap.

5. **Node Schema & Usage Rules (STRICTLY FOLLOW THESE):**

   - **Common Fields**:
     - \`id\`: string (unique identifier)
     - \`type\`: string (one of 'textNode', 'imageNode', 'notesNode', 'subflow')
     - \`position\`: { \`x\`: number, \`y\`: number }
     - \`data\`: object (properties vary by type)
     - \`parentId\`: string (OPTIONAL, ID of the parent 'subflow' node if this node is inside a group)
     - \`extent\`: string (OPTIONAL, set to 'parent' IF \`parentId\` is set)
     - \`style\`: object (OPTIONAL, CSS styles)

   - **'textNode'**:
     - Use for: Titles, headers, short labels.
     - \`data\`: { \`label\`: string, \`color\`: string (hex), \`textColor\`: string (hex) }

   - **'imageNode'**:
     - Use for: Displaying images.
     - \`data\`: { \`label\`: string, \`src\`: string (URL) }

   - **'notesNode'**:
     - Use for: Long descriptions, paragraphs, detailed explanations.
     - \`data\`: { \`label\`: string (markdown supported), \`color\`: string (hex), \`textColor\`: string (hex) }

   - **'subflow' (Group Node)**:
     - Use for: Grouping related nodes together.
     - \`data\`: { \`label\`: string, \`color\`: string (hex) }
     - \`style\`: { \`width\`: number, \`height\`: number, \`backgroundColor\`: string (rgba) }

6. **Grouping Logic (CRITICAL):**
   - If you create a 'subflow' (group), you MUST set its \`style.width\` and \`style.height\` large enough to contain its children.
   - Any node that belongs to a group MUST have:
     - \`parentId\`: The ID of the group node.
     - \`extent\`: 'parent'.
     - \`position\`: Relative to the group's top-left corner (0,0). e.g., { x: 50, y: 50 } would be 50px inside the group.

7. Return format:
   {
     "nodes": [
       { "id": "...", "type": "...", "position": { "x": ..., "y": ... }, "data": { ... }, "parentId": "...", "extent": "..." }
     ],
     "edges": [
       { "id": "...", "source": "...", "target": "..." }
     ]
   }

8. **Styling**: Assign a **DIFFERENT, DISTINCT background color** (hex code) to EACH node to ensure visual separation. Include this in \`data.color\`. `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: context,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    // Clean up markdown if present
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const flowData = JSON.parse(jsonString);

    // Post-process edges to ensure they have IDs
    if (flowData.edges) {
      flowData.edges = flowData.edges.map((edge, index) => ({
        ...edge,
        id: edge.id || `gen-edge-${Date.now()}-${index}`
      }));
    }

    // Post-process group nodes to ensure they are large enough
    if (flowData.nodes) {
      const groupNodes = flowData.nodes.filter(n => n.type === 'subflow');

      groupNodes.forEach(group => {
        const children = flowData.nodes.filter(n => n.parentId === group.id);

        if (children.length > 0) {
          let maxX = 0;
          let maxY = 0;

          children.forEach(child => {
            // Estimate child dimensions based on type
            let width = 150;
            let height = 80;

            if (child.type === 'textNode') { width = 200; height = 100; }
            else if (child.type === 'imageNode') { width = 150; height = 150; }
            else if (child.type === 'notesNode') { width = 250; height = 200; }

            const childRight = (child.position.x || 0) + width;
            const childBottom = (child.position.y || 0) + height;

            if (childRight > maxX) maxX = childRight;
            if (childBottom > maxY) maxY = childBottom;
          });

          // Add padding
          const padding = 50;
          const requiredWidth = maxX + padding;
          const requiredHeight = maxY + padding;

          // Update group style
          group.style = {
            ...group.style,
            width: Math.max(group.style?.width || 0, requiredWidth),
            height: Math.max(group.style?.height || 0, requiredHeight),
          };
        }
      });
    }

    return flowData;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate flow from Gemini.");
  }
};
