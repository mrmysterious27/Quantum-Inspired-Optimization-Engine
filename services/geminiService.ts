import { GoogleGenAI } from "@google/genai";
import { Node, OptimizationParams, OptimizationResponse } from "../types";

const SYSTEM_INSTRUCTION = `
You are the Optimization Engine for an app called **QIOE — Quantum-Inspired Optimization Engine**.

Your task is to simulate a **quantum-inspired optimization algorithm** (not real quantum computing).
You solve optimization problems like TSP or shortest-path using classical heuristics such as:

- Quantum-inspired annealing
- Probabilistic tunneling
- Energy minimization
- Random route mutations

You must always output the result in a structured JSON format.

---

## INPUT FORMAT (from user)

The user will send:

{
  "context": "Description of the real world problem (e.g., US Supply Chain)",
  "problem": "tsp" or "shortest_path",
  "start_node_id": 0,
  "nodes": [
    {"id":0,"x":34,"y":90, "label": "Seattle"},
    ...
  ],
  "dist_matrix": [[0,12,5,...],[12,0,6,...],...],
    "params":{
      "steps": 5000,
      "init_temp": 10,
      "tunneling_rate": 0.3
  }
}

---

## YOUR REQUIRED OUTPUT

Always output valid JSON with these keys:

{
  "summary": {
    "problem_type": "...",
    "total_nodes": ...,
    "parameters_used": {...}
  },

  "iterations": [
    {
      "step": 120,
      "current_route": [...],
      "current_energy": 156.3,
      "best_route": [...],
      "best_energy": 142.1,
      "tunneling": true
    },
    ...
  ],

  "final_result": {
    "best_route": [...],
    "best_energy": ...,
    "total_iterations": ...,
    "tunneling_events": ...
  },

  "explanation": "A contextual explanation of the solution. If a context is provided (e.g. Supply Chain), use terms relevant to that domain (e.g. 'distribution hubs', 'routes', 'latencies'). Explain how the quantum features helped escape local minima."
}

---

## RULES FOR SIMULATION

- The returned route MUST start with the node specified in "start_node_id".
- Simulate route changes by swapping nodes (keeping start node fixed if necessary, or rotating the result).
- Energy = sum of distances along the route.
- Accept better moves always.
- Accept worse moves probabilistically:
  tunneling_rate * exp(-(delta_energy)/temp)
- Gradually lower temperature.
- Do NOT simulate all steps literally; generate 20 sampled iteration logs that show progressive improvement.
- Keep internal logic consistent.
- Never output anything outside the JSON structure.

---

## WHAT YOU SHOULD NEVER DO

- Never mention internal reasoning.
- Never say you cannot compute distances — approximate them.
- Never output more than 20 iteration logs.
- Never add text outside the JSON.
`;

const calculateDistance = (n1: Node, n2: Node): number => {
  return Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));
};

const generateDistanceMatrix = (nodes: Node[]): number[][] => {
  return nodes.map((n1) =>
    nodes.map((n2) => parseFloat(calculateDistance(n1, n2).toFixed(2)))
  );
};

export const runOptimization = async (
  nodes: Node[],
  params: OptimizationParams,
  startNodeId: number,
  context: string = "Abstract Mathematical Optimization"
): Promise<OptimizationResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set REACT_APP_GEMINI_API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const distMatrix = generateDistanceMatrix(nodes);

  const payload = {
    context: context,
    problem: "tsp",
    start_node_id: startNodeId,
    nodes: nodes,
    dist_matrix: distMatrix,
    params: params,
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: JSON.stringify(payload),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from optimization engine.");
    }

    return JSON.parse(text) as OptimizationResponse;
  } catch (error) {
    console.error("Optimization failed:", error);
    throw error;
  }
};
