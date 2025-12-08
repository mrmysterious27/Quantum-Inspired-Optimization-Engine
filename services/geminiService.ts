import { GoogleGenAI } from "@google/genai";
import { Node, OptimizationParams, OptimizationResponse } from "../types";

const SYSTEM_INSTRUCTION = `
You are the Optimization Engine for an app called **QIOE — Quantum-Inspired Optimization Engine**.

Your task is to simulate various optimization algorithms solving problems like TSP.
You must always output the result in a structured JSON format.

---

## INPUT FORMAT (from user)

The user will send:

{
  "context": "Description of the real world problem",
  "problem": "tsp",
  "start_node_id": 0,
  "nodes": [...],
  "dist_matrix": [...],
  "params":{
      "steps": 5000,
      "init_temp": 10,
      "tunneling_rate": 0.3,
      "algorithm": "quantum_annealing" // OR "simulated_annealing", "greedy", "random"
  }
}

---

## ALGORITHM BEHAVIORS

The input includes an "algorithm" field. You MUST simulate the behavior of that specific algorithm:

1. **quantum_annealing** (Default):
   - Logic: Classical annealing + probabilistic "tunneling" (jumps across energy barriers).
   - "tunneling" field in iterations: Set to TRUE when a high-energy jump occurs.
   - Performance: High convergence, finds global or near-global optima.

2. **simulated_annealing**:
   - Logic: Standard thermal cooling. Accept worse moves based on exp(-delta/T).
   - "tunneling" field in iterations: Set to FALSE (thermal fluctuations are not quantum tunneling).
   - Performance: Good exploration, but slower to converge than quantum-inspired methods.

3. **greedy**:
   - Logic: Nearest Neighbor / Greedy descent. Only accept moves that improve energy.
   - "tunneling" field in iterations: ALWAYS FALSE.
   - Performance: Very fast convergence to a local minimum, then flatlines (gets stuck).

4. **random**:
   - Logic: Pure stochastic search.
   - "tunneling" field in iterations: ALWAYS FALSE.
   - Performance: High variance, generally poor results compared to others.

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
      "tunneling": true/false // Depends on algorithm rules above
    },
    ...
  ],

  "final_result": {
    "best_route": [...],
    "best_energy": ...,
    "total_iterations": ...,
    "tunneling_events": ...
  },

  "explanation": "A contextual explanation. Mention the algorithm used. E.g., 'Using the Greedy approach, the agent quickly found a route but got stuck...' or 'Quantum Annealing successfully tunneled through...'"
}

---

## RULES FOR SIMULATION

- The returned route MUST start with the node specified in "start_node_id".
- Energy = sum of distances along the route.
- Do NOT simulate all steps literally; generate 20 sampled iteration logs that show the progression typical of the selected algorithm.
- Keep internal logic consistent with the chosen algorithm.
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