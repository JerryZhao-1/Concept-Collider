import { GoogleGenAI, Type } from "@google/genai";
import { SynthesisResult, ExplorationResult, DemoResult } from "../types";
import { findSample, findSampleByTitle } from "../data/samples";

let aiClient: GoogleGenAI | null = null;
const getAiClient = () => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY || '';
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

// Mode 0: Logic Path
export const generateLogicPath = async (conceptA: string, conceptB: string): Promise<string[]> => {
  const sample = findSample(conceptA, conceptB);
  if (sample && sample.logicPath) {
    return sample.logicPath;
  }

  const model = "gemini-2.0-flash-exp";
  const prompt = `
    Task: Create a semantic knowledge path connecting "${conceptA}" to "${conceptB}".

      Rules:
    1. The path MUST have between 4 to 6 nodes(steps).
    2. Do NOT just return ["${conceptA}", "${conceptB}"]. You MUST insert intermediate logical concepts.
    3. The connection must be strictly logical(e.g. Mushroom -> Mycelium -> Network -> Internet -> Architecture).
    4. Avoid generic hubs like "Science" or "Earth". Use specific technical terms.
    5. Return ONLY a JSON array of strings.
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [conceptA, conceptB];
    const path = JSON.parse(text);
    return Array.isArray(path) ? path : [conceptA, conceptB];
  } catch (e) {
    console.error("Logic path generation failed", e);
    return [conceptA, conceptB];
  }
};

// Mode 1: Collision
export const synthesizeConcepts = async (conceptA: string, conceptB: string, logicPath?: string[]): Promise<SynthesisResult> => {
  const sample = findSample(conceptA, conceptB);
  if (sample) {
    // Simulate API latency for "deep thought"
    await new Promise(resolve => setTimeout(resolve,10000));
    return { ...sample, logicPath: logicPath || sample.logicPath };
  }

  const model = "gemini-2.0-flash-exp";

  let bridgeInstruction = "";
  if (logicPath && logicPath.length > 2) {
    const pathStr = logicPath.join(" -> ");
    bridgeInstruction = `
    CRITICAL: A logic bridge has been verified using Graph Theory.
      You MUST build the new discipline based on this specific semantic chain:
    ${pathStr}

    (Example: If chain is Mushroom -> Chitin -> Architecture, the discipline must rely on chitinous polymers).
    `;
  }

  const prompt = `
    You are the "Concept Collider".
      Task: Perform a high-velocity cognitive collision between "${conceptA}" and "${conceptB}".
        ${bridgeInstruction}

    1. Synthesize a BRAND NEW, theoretically self-consistent academic discipline.
    2. Analyze its Feasibility(how possible is it with current or near-future tech?).
    3. Return a detailed JSON.
  `;

  const response = await getAiClient().models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          disciplineName: { type: Type.STRING },
          tagline: { type: Type.STRING },
          definition: { type: Type.STRING },
          axioms: { type: Type.ARRAY, items: { type: Type.STRING } },
          application: { type: Type.STRING },
          visualPrompt: { type: Type.STRING, description: "Technical, schematic visual description for a blueprint." },
          feasibilityScore: { type: Type.NUMBER, description: "Score 0-100" },
          feasibilityAnalysis: { type: Type.STRING, description: "Why is it feasible or not?" },
        },
        required: ["disciplineName", "tagline", "definition", "axioms", "application", "visualPrompt", "feasibilityScore", "feasibilityAnalysis"],
      },
    }
  });

  const text = response.text;
  if (!text) throw new Error("No data returned from collider.");

  const result = JSON.parse(text) as SynthesisResult;
  result.logicPath = logicPath;
  return result;
};

// Mode 2: Exploration
export const exploreConcept = async (concept: string): Promise<ExplorationResult> => {
  const { findExplorationSample } = await import("../data/samples");
  const sample = findExplorationSample(concept);

  if (sample) {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve,10000));
    return sample;
  }

  const model = "gemini-2.0-flash-exp";

  const prompt = `
    You are a Scientific Scout.
      Task: Analyze the domain "${concept}".
        Identify 3 unrelated, underdeveloped, or "fringe" sub-fields or intersection points that could emerge from this domain but haven't been fully explored yet.
    For each, estimate feasibility.
  `;

  const response = await getAiClient().models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fields: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                feasibilityScore: { type: Type.NUMBER },
                application: { type: Type.STRING },
                visualPrompt: { type: Type.STRING }
              },
              required: ["name", "description", "feasibilityScore", "application", "visualPrompt"]
            }
          }
        },
        required: ["fields"]
      },
    }
  });

  const text = response.text;
  if (!text) throw new Error("No exploration data returned.");

  const data = JSON.parse(text);
  return {
    rootConcept: concept,
    fields: data.fields
  };
};

// Mode 3: Visual Blueprint
export const generateBlueprint = async (visualPrompt: string): Promise<string | null> => {
  if (visualPrompt.startsWith("SAMPLE:")) {
    const suffix = visualPrompt.split(":")[1];
    return `/samples/${suffix}.png`;
  }

  const model = "gemini-2.0-flash-exp";
  try {
    const response = await getAiClient().models.generateContent({
      model,
      contents: {
        parts: [{
          text: `Create a technical blueprint diagram: ${visualPrompt}.
     Style: Vector, architectural schematic, cyan lines on dark background. Minimalist.` }]
      },
      config: {
        responseMimeType: "image/png"
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }

    return null;

  } catch (error: any) {
    console.warn("Blueprint generation failed (non-fatal):", error.message);
    return null;
  }
};

// New Function: Generate Demo Program
export const synthesizeDemo = async (title: string, description: string): Promise<DemoResult> => {
  // Check for sample data first
  const sample = findSampleByTitle(title);

  if (sample && sample.demoHtml) {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 15000));
    return {
      code: sample.demoHtml,
      label: "Live Concept Simulation",
      instructions: "Adjust variables to observe system behavior."
    };
  }

  try {
    const model = "gemini-2.0-flash-exp";

    const prompt = `
    You are a Creative Coder and Scientific Visualization Expert.
      Task: Create a self-contained, interactive HTML5/JavaScript "Micro-App" that simulates or visualizes the concept: "${title}".
        Context: ${description}

    Requirements:
    1. Output JSON ONLY in this format: { "label": "Short Title", "instructions": "1-sentence user guide", "html": "Full HTML string" }.
    2. The "html" field must contain a complete HTML document with <style> and <script>.
    3. CONTENT:
    - Use HTML5 <canvas> to create a generative animation, simulation, or data visualization.
       - The visualization should reflect the "logic" of the concept (e.g., if it's "Myco-Architecture", show organic structures growing; if "Quantum-Jazz", show vibrating waves).
      - Make it interactive (e.g., react to mousemove, click, or time).
    4. AESTHETIC (Crucial):
    - Background MUST be transparent or dark (#020617).
       - Colors: Cyan (#22d3ee), Fuchsia (#d946ef), White, Emerald (#10b981).
       - Style: Sci-fi, Wireframe, Blueprint, HUD, or Minimalist.
    5. TECH:
    - Use Vanilla JavaScript. 
       - Do NOT use external images. 
       - You MAY use Math functions for procedural generation.
       - Ensure the canvas resizes to fit the window.
    `;

    const response = await getAiClient().models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No code generated.");

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error("JSON parse error in demo", e);
      throw new Error("Failed to parse simulation code.");
    }

    if (!result.html && result.code) result.html = result.code;

    return {
      code: result.html,
      label: result.label || "Interactive Simulation",
      instructions: result.instructions || "Interact with the visualization using your mouse."
    };

  } catch (e: any) {
    console.error("Demo Synthesis Error:", e);
    throw new Error(e.message || "Failed to create prototype.");
  }
};