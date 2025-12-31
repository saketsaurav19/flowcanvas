import { geminiNative } from "./geminiNative";
import { generateFlow as generateJson } from "./geminiCall";
import { applyPatch } from 'fast-json-patch';
import { SYSTEM_PROMPTS, USER_PROMPTS } from '../locales/promt';
import { JSON_PATCH_SCHEMA } from '../locales/geminiSchema';

/**
 * Optimized Flow Generation using 4 Phases and JSON Patch (RFC 6902)
 */
export const generateFlow = async (topic, currentNodes, currentEdges, apiKey, model, abortSignal) => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  console.log("🚀 Starting 4-Phase Flow Generation (JSON Patch RFC 6902)...");

  // --- SCHEMAS ---

  // RFC 6902 JSON Patch Schema for Gemini
  const JSON_PATCH_SCHEMA = {
    type: Type.ARRAY,
    description: "An array of JSON Patch operations as per RFC 6902.",
    items: {
      type: Type.OBJECT,
      required: ["op", "path"],
      properties: {
        op: {
          type: Type.STRING,
          enum: ["add", "remove", "replace", "move", "copy", "test"],
          description: "The operation to perform."
        },
        path: {
          type: Type.STRING,
          description: "JSON Pointer path (e.g., /nodes/node_1 or /nodes/node_1/data/label)."
        },
        value: {
          type: Type.OBJECT,
          description: "The value to add or replace. For nodes, use the full node structure.",
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING },
            data: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                use_case: { type: Type.STRING },
                src: { type: Type.STRING },
                color: { type: Type.STRING }
              }
            },
            position: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
              }
            },
            source: { type: Type.STRING },
            target: { type: Type.STRING },
            label: { type: Type.STRING }
          }
        },
        from: {
          type: Type.STRING,
          description: "The source path for move or copy operations."
        }
      }
    }
  };

  // --- PREPARE CONTEXT (Map-based for reliable patching) ---
  // Using spread operator to preserve ALL fields (measured, extent, dragging, etc.)
  const nodeMap = currentNodes.reduce((acc, node) => {
    acc[node.id] = {
      ...node,
      // Ensure defaults if missing (though spreading node usually covers this)
      data: {
        ...(node.data || {}),
        label: node.data?.label || "",
      },
      position: node.position || { x: 0, y: 0 }
    };
    return acc;
  }, {});

  const edgeMap = currentEdges.reduce((acc, edge) => {
    if (!edge) return acc;
    acc[edge.id] = {
      ...edge
    };
    return acc;
  }, {});

  let currentGraphContext = {
    nodes: nodeMap,
    edges: edgeMap
  };

  // --- PHASE 1: Intent -> Logical Steps (TEXT) ---
  console.log("Phase 1: Analyzing Intent...");
  const phase1SystemPrompt = SYSTEM_PROMPTS.PHASE_1;
  const phase1UserPrompt = USER_PROMPTS.PHASE_1(topic);
  const logicalSteps = await geminiNative(phase1UserPrompt, apiKey, phase1SystemPrompt, currentNodes, currentEdges);
  console.log("Phase 1 Output:", logicalSteps);

  // --- PHASE 2: Logical Steps -> Graph Semantics (Nodes/Edges, NO POSITIONS) ---
  console.log("Phase 2: Generating Structure Patches...");
  const phase2SystemPrompt = SYSTEM_PROMPTS.PHASE_2;
  const phase2UserPrompt = USER_PROMPTS.PHASE_2(logicalSteps, currentGraphContext);

  const structurePatchJson = await generateJson(
    phase2UserPrompt, "application/json", 0.1, JSON_PATCH_SCHEMA, phase2SystemPrompt, [], [], apiKey, model, abortSignal
  );

  let structureOps = parsePatch(structurePatchJson);
  console.log("Structure Ops:", structureOps);
  const docAfterPhase2 = JSON.parse(JSON.stringify(currentGraphContext));
  const phase2Result = applyPatch(docAfterPhase2, structureOps, false, true);
  currentGraphContext = phase2Result.newDocument;
  console.log("Phase 2 Result:", currentGraphContext);

  // --- PHASE 3: Graph -> Layout + Styling (POSITIONS ONLY) ---
  console.log("Phase 3: Generating Layout Patches...");
  const phase3SystemPrompt = SYSTEM_PROMPTS.PHASE_3;
  const phase3UserPrompt = USER_PROMPTS.PHASE_3(currentGraphContext);

  const layoutPatchJson = await generateJson(
    phase3UserPrompt, "application/json", 0.1, JSON_PATCH_SCHEMA, phase3SystemPrompt, [], [], apiKey, model, abortSignal
  );

  let layoutOps = parsePatch(layoutPatchJson);
  console.log("Layout Ops:", layoutOps);
  const docAfterPhase3 = JSON.parse(JSON.stringify(currentGraphContext));
  const phase3Result = applyPatch(docAfterPhase3, layoutOps, false, true);
  currentGraphContext = phase3Result.newDocument;
  console.log("Phase 3 Result:", currentGraphContext);

  // --- PHASE 4: Validation / Repair (OPTIONAL LOOP) ---
  console.log("Phase 4: Validating Graph...");

  const validateGraph = (graph) => {
    const issues = [];
    const nodeIds = new Set(Object.keys(graph.nodes));

    Object.entries(graph.edges).forEach(([id, edge]) => {
      if (!nodeIds.has(edge.source)) issues.push(`Edge ${id} has invalid source ${edge.source}`);
      if (!nodeIds.has(edge.target)) issues.push(`Edge ${id} has invalid target ${edge.target}`);
    });

    return issues;
  };

  let issues = validateGraph(currentGraphContext);
  if (issues.length > 0) {
    console.warn("Found structural issues, attempting repair...");
    const repairPrompt = USER_PROMPTS.REPAIR(issues);
    const repairPatchJson = await generateJson(
      repairPrompt, "application/json", 0.1, JSON_PATCH_SCHEMA, SYSTEM_PROMPTS.REPAIR, [], [], apiKey, model, abortSignal
    );
    const repairOps = parsePatch(repairPatchJson);
    const docAfterRepair = JSON.parse(JSON.stringify(currentGraphContext));
    const repairResult = applyPatch(docAfterRepair, repairOps, false, true);
    currentGraphContext = repairResult.newDocument;
  }

  // --- CONVERT BACK TO ARRAYS ---
  const finalNodes = Object.values(currentGraphContext.nodes)
    .filter((n) => n && typeof n === 'object');

  const finalEdges = Object.values(currentGraphContext.edges)
    .filter((e) => e && typeof e === 'object');

  return { nodes: finalNodes, edges: finalEdges };
};

function parsePatch(jsonString) {
  let ops;
  try {
    ops = JSON.parse(jsonString);
  } catch (e) {
    const cleaned = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    try { ops = JSON.parse(cleaned); } catch (e2) { return []; }
  }
  if (!Array.isArray(ops) && ops.patch) ops = ops.patch;
  if (!Array.isArray(ops) && ops.operations) ops = ops.operations;
  return Array.isArray(ops) ? ops : (ops.op ? [ops] : []);
}
