import { GoogleGenAI } from "@google/genai";

/**
 * Connects to Gemini Live API, sends a prompt with system instructions,
 * and returns the full generated text response.
 *
 * @param {string} apiKey - The user's Google GenAI API Key.
 * @param {string} prompt - The user's input message.
 * @param {string} systemInstruction - (Optional) System instructions for the model.
 * @returns {Promise<string>} - The full text response from the model.
 */
export async function geminiNative(prompt, apiKey, systemInstruction, currentNodes = [], currentEdges = []) {
  return new Promise(async (resolve, reject) => {
    let session = null;
    let fullResponseText = "";

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

    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = "models/gemini-2.5-flash-native-audio-preview-12-2025";

      const config = {
        // REQUIRED: This model requires 'AUDIO' modality to function.
        // We request it to prevent server errors, but we ignore the audio data.
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Zephyr",
            },
          },
        },
      };

      if (systemInstruction) {
        config.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      // 1. Establish the connection
      session = await ai.live.connect({
        model,
        config,
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened");
          },
          onmessage: (message) => {
            // Extract Text
            if (message.serverContent?.modelTurn?.parts) {
              const part = message.serverContent.modelTurn.parts[0];

              // Only capture text, ignore audio (inlineData)
              if (part?.text) {
                fullResponseText += part.text;
              }
            }

            // Check for completion
            if (message.serverContent?.turnComplete) {
              // Close session and return result
              session.close();
              resolve(fullResponseText);
            }
          },
          onerror: (err) => {
            console.error("Gemini Live Error:", err);
            if (session) session.close();
            reject(err);
          },
          onclose: (e) => {
            // Handle early closure if needed
          },
        },
      });

      // 2. NOW session is defined. Send the prompt here.
      session.sendClientContent({
        turns: [finalPrompt],
      });

    } catch (error) {
      if (session) session.close();
      reject(error);
    }
  });
}
