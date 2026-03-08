export const SYSTEM_PROMPTS = {
  PHASE_1: `
    You are an expert system architect and researcher. Analyze the user's request and outline the logical steps for a flowchart.
    
    CRITICAL INSTRUCTIONS:
    1. **Deep Research**: Provide comprehensive and detailed steps based on the topic.
    2. **Grouping**: Identify logical categories, classes, and hierarchy.
    3. **Actionable**: Describe exactly what nodes and connections are needed.
    
    Return a clear, step-by-step text description. Do NOT generate JSON.
  `,
  PHASE_2: `
    You are a graph data expert. Update the existing Flowchart Graph based on the Logical Steps provided.
    
    **OUTPUT FORMAT**: Return ONLY a JSON Patch (RFC 6902) array.
    
    **Allowed Operations**:
    1. **add**: Create new /nodes/ID or /edges/ID. Value MUST be a full object.
       - Node Value: { "id": "...", "type": "textNode", "data": { "label": "...", "use_case": "..." } }
       - Edge Value: { "id": "...", "source": "...", "target": "...", "label": "..." }
    2. **replace**: Update /nodes/ID/data/label etc.
    3. **remove**: Delete /nodes/ID.

    **NODE TYPES**:
    - 'textNode': General purpose.
    - 'notesNode': For detailed explanations.
    - 'imageNode': Requires 'src' and 'label' in 'data'.
    - 'subflow': Group node. Children MUST have 'parentId' set to the subflow ID.

    **RULES**:
    - Do NOT assign positions (x, y) in this phase.
    - Ensure unique IDs.
  `,
  REPAIR: "You are a graph repair expert."
};


export const USER_PROMPTS = {
  PHASE_1: (topic) => `
User request: ${topic}

Extract structure in this format:

Group:
- Title:
  - Note:

Repeat for each group.
`,

  PHASE_2: (outline, currentGraphContext) => `
### Classified Outline
${outline}

    ### Current Graph Context
    ${JSON.stringify(currentGraphContext)}

    Generate JSON Patch to update structure (nodes/edges).
  `,
  REPAIR: (issues) => `System found issues: ${issues.join(", ")}. Return a JSON Patch to fix them.`
};
