import { GoogleGenAI } from "@google/genai";

export const generateFlow = async (topic, currentNodes, currentEdges, apiKey) => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
You are an expert system architect and flowchart designer.
Your goal is to output a valid JSON object containing 'nodes' and 'edges' based on the user's instruction and the current flow context.

STRICT OUTPUT RULES:
1. Return ONLY a valid JSON object.
2. Do NOT include markdown formatting (like \`\`\`json).
3. Do NOT include any conversational text.

NODE SCHEMA & USAGE:
- **Common Fields**:
  - \`id\`: string (unique identifier)
  - \`type\`: string ('textNode', 'imageNode', 'notesNode', 'subflow')
  - \`position\`: { \`x\`: number, \`y\`: number }
  - \`data\`: object (properties vary by type)
  - \`parentId\`: string (OPTIONAL, for nodes inside a group)
  - \`extent\`: string ('parent' IF \`parentId\` is set)
  - \`style\`: object (OPTIONAL, CSS styles)

- **'textNode'**:
  - \`data\`: { \`label\`: string, \`color\`: string (hex), \`textColor\`: string (hex) }
- **'imageNode'**:
  - \`data\`: { \`label\`: string, \`src\`: string (URL) }
- **'notesNode'**:
  - \`data\`: { \`label\`: string (markdown), \`color\`: string (hex), \`textColor\`: string (hex) }
- **'subflow' (Group Node)**:
  - \`data\`: { \`label\`: string, \`color\`: string (hex) }
  - \`style\`: { \`backgroundColor\`: string (rgba) }

GROUPING LOGIC:
- Children of a group MUST have \`parentId\` set to the group's ID, \`extent: 'parent'\`, and \`position\` relative to the group (0,0 is top-left).

LAYOUT & STYLING:
- Use a clear TOP-DOWN hierarchy for new flows.
- Maintain ~100px vertical and ~500px horizontal spacing.
- Assign DISTINCT background colors to each node for visual separation.
- If modifying, respect existing layout unless asked to reorganize.

RETURN FORMAT:
{
  "nodes": [ ... ],
  "edges": [ ... ]
}
`;

  const userPrompt = `
CURRENT FLOW CONTEXT:
Nodes: ${JSON.stringify(currentNodes.map(n => ({ id: n.id, label: n.data.label, type: n.type, parentId: n.parentId })))}
Edges: ${JSON.stringify(currentEdges.map(e => ({ id: e.id, source: e.source, target: e.target, label: e.label || "" })))}

USER INSTRUCTION:
${topic}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: systemInstruction,
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
    // Removed as per user request to not assign width/height

    if (flowData.nodes) {
      const groupNodes = flowData.nodes.filter(n => n.type === 'subflow');

      groupNodes.forEach(group => {
        const children = flowData.nodes.filter(n => n.parentId === group.id);

        if (children.length > 0) {
          let maxX = 0;
          let maxY = 0;

          children.forEach(child => {
            // Estimate child dimensions based on type or use existing measurements
            let width = child.measured?.width || child.style?.width || child.width || 150;
            let height = child.measured?.height || child.style?.height || child.height || 80;

            if (!child.measured && !child.style?.width && !child.width) {
              if (child.type === 'textNode') { width = 200; height = 100; }
              else if (child.type === 'imageNode') { width = 150; height = 150; }
              else if (child.type === 'notesNode') { width = 250; height = 200; }
            }

            const childRight = (child.position.x || 0) + width;
            const childBottom = (child.position.y || 0) + height;

            if (childRight > maxX) maxX = childRight;
            if (childBottom > maxY) maxY = childBottom;
          });

          // Add padding
          const padding = 100;
          const requiredWidth = maxX + padding;
          const requiredHeight = maxY + padding;

          // Update group style
          group.style = {
            ...group.style,
            width: requiredWidth,
            height: requiredHeight,
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
