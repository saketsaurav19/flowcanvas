import { GoogleGenAI, Type } from "@google/genai";

export const generateFlow = async (prompt, responseType, temperature, responseSchema, systemInstruction, currentNodes = [], currentEdges = [], apiKey, model, abortSignal) => {
    let finalPrompt = prompt;

    if (currentNodes.length > 0 || currentEdges.length > 0) {
        finalPrompt += `
        
        ### Current Flow Context
        The following nodes and edges already exist in the flow. 
        **CRITICAL INSTRUCTION**: 
        1. Do NOT regenerate these nodes unless you are explicitly updating their properties.
        2. Do NOT use the same IDs for new nodes. Check the existing IDs and generate unique ones.
        3. Connect new nodes to this existing structure where relevant.

        Existing Nodes: ${JSON.stringify(currentNodes.map(n => ({ id: n.id, label: n.data?.label, type: n.type })))}
        Existing Edges: ${JSON.stringify(currentEdges.map(e => ({ source: e.source, target: e.target, id: e.id })))}
        `;
    }

    if (!apiKey) {
        throw new Error("API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });



    try {
        if (abortSignal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        const generatePromise = ai.models.generateContent({
            model: model,
            contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
            systemInstruction: systemInstruction,
            config: {
                temperature: temperature || 1,
                responseMimeType: responseType,
                responseSchema: responseSchema
            },
        }, { signal: abortSignal });

        const abortPromise = new Promise((_, reject) => {
            if (abortSignal) {
                abortSignal.addEventListener('abort', () => {
                    reject(new DOMException('Aborted', 'AbortError'));
                });
            }
        });

        const response = await Promise.race([generatePromise, abortPromise]);

        const text = response.text;

        // Clean up markdown if present
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return jsonString;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate flow from Gemini.");
    }
};
