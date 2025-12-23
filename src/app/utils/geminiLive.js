import { GoogleGenAI, Modality } from '@google/genai';

/**
 * Generates content using the Gemini Live API (WebSocket).
 */
export const geminiLive = async (
  {
    prompt,
    apiKey,
    model = 'gemini-live-2.5-flash-preview',
    systemInstruction,
    generationConfig,
    currentNodes = [],
    currentEdges = []
  },
  abortSignal
) => {
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

  const client = new GoogleGenAI({ apiKey });

  const config = {
    responseModalities: [Modality.TEXT],
    systemInstruction: systemInstruction
      ? { parts: [{ text: systemInstruction }] }
      : undefined,
    ...generationConfig
  };

  const responseQueue = [];
  let fullResponse = '';
  let session;

  // ---- helpers --------------------------------------------------

  async function waitMessage() {
    while (true) {
      if (abortSignal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const msg = responseQueue.shift();
      if (msg) return msg;

      await new Promise(r => setTimeout(r, 50));
    }
  }

  async function handleTurn() {
    let idleTicks = 0;

    while (true) {
      const msg = await waitMessage();

      if (msg.serverContent?.turnComplete) {
        break;
      }

      // fallback: stop if no messages for ~1 second
      idleTicks++;
      if (idleTicks > 20) {
        break;
      }
    }
  }

  // ---- execution ------------------------------------------------

  try {
    if (abortSignal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    session = await client.live.connect({
      model,
      config,
      callbacks: {
        onmessage(message) {
          responseQueue.push(message);

          const parts = message.serverContent?.modelTurn?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.text) {
                fullResponse += part.text;
              }
            }
          }
        },
        onError(error) {
          console.error("Gemini Live WebSocket error:", error);
        }
      }
    });

    abortSignal?.addEventListener('abort', () => {
      session?.close();
    });

    await session.sendRealtimeInput({ text: finalPrompt });

    await handleTurn();

    return fullResponse.trim();

  } finally {
    session?.close();
  }
};

