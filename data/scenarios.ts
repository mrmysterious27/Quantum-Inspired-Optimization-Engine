import { Node } from '../types';

export const SCENARIOS = {
  random: {
    label: "Random Field",
    description: "Abstract mathematical optimization on a random field.",
    fixedNodes: false
  },
  india: {
    label: "Indian Cities Tour",
    description: "Optimizing travel route across major Indian cities.",
    fixedNodes: true,
    nodes: [
      { id: 0, x: 30, y: 5, label: "Srinagar" },
      { id: 1, x: 32, y: 25, label: "Delhi" },
      { id: 2, x: 25, y: 30, label: "Jaipur" },
      { id: 3, x: 45, y: 30, label: "Lucknow" },
      { id: 4, x: 55, y: 32, label: "Patna" },
      { id: 5, x: 85, y: 30, label: "Guwahati" },
      { id: 6, x: 70, y: 45, label: "Kolkata" },
      { id: 7, x: 65, y: 55, label: "Bhubaneswar" },
      { id: 8, x: 10, y: 40, label: "Ahmedabad" },
      { id: 9, x: 12, y: 60, label: "Mumbai" },
      { id: 10, x: 18, y: 65, label: "Pune" },
      { id: 11, x: 40, y: 50, label: "Nagpur" },
      { id: 12, x: 40, y: 70, label: "Hyderabad" },
      { id: 13, x: 35, y: 85, label: "Bangalore" },
      { id: 14, x: 45, y: 85, label: "Chennai" },
      { id: 15, x: 32, y: 95, label: "Thiruvananthapuram" }
    ] as Node[]
  },
  logistics: {
    label: "US Supply Chain",
    description: "Optimizing a distribution route across major US tech hubs.",
    fixedNodes: true,
    nodes: [
      { id: 0, x: 10, y: 15, label: "Seattle" },
      { id: 1, x: 10, y: 75, label: "Los Angeles" },
      { id: 2, x: 15, y: 25, label: "Boise" },
      { id: 3, x: 25, y: 65, label: "Phoenix" },
      { id: 4, x: 35, y: 25, label: "Denver" },
      { id: 5, x: 45, y: 60, label: "Dallas" },
      { id: 6, x: 50, y: 40, label: "Kansas City" },
      { id: 7, x: 55, y: 20, label: "Chicago" },
      { id: 8, x: 60, y: 70, label: "New Orleans" },
      { id: 9, x: 75, y: 50, label: "Atlanta" },
      { id: 10, x: 80, y: 30, label: "D.C." },
      { id: 11, x: 85, y: 15, label: "New York" },
      { id: 12, x: 90, y: 20, label: "Boston" },
      { id: 13, x: 85, y: 85, label: "Miami" }
    ] as Node[]
  },
  circuit: {
    label: "PCB Trace Drilling",
    description: "Minimizing movement for a CNC drill on a circuit board.",
    fixedNodes: true,
    nodes: [
      // Cluster 1 (CPU Socket)
      { id: 0, x: 40, y: 40 }, { id: 1, x: 42, y: 40 }, { id: 2, x: 40, y: 42 }, { id: 3, x: 42, y: 42 },
      // Cluster 2 (Memory Controller)
      { id: 4, x: 60, y: 40 }, { id: 5, x: 62, y: 40 }, { id: 6, x: 60, y: 42 }, { id: 7, x: 62, y: 42 },
      // Peripherals
      { id: 8, x: 10, y: 10 }, { id: 9, x: 10, y: 90 }, { id: 10, x: 90, y: 10 }, { id: 11, x: 90, y: 90 },
      // Bus lines
      { id: 12, x: 20, y: 50 }, { id: 13, x: 30, y: 50 }, { id: 14, x: 70, y: 50 }, { id: 15, x: 80, y: 50 }
    ] as Node[]
  },
  delivery: {
    label: "Last-Mile Delivery",
    description: "Optimizing neighborhood parcel drop-offs.",
    fixedNodes: true,
    nodes: Array.from({ length: 20 }, (_, i) => ({
      id: i,
      // Create a grid-like block structure
      x: (i % 5) * 20 + 10 + (Math.random() * 5 - 2.5), 
      y: Math.floor(i / 5) * 20 + 10 + (Math.random() * 5 - 2.5),
      label: `House ${i+1}`
    })) as Node[]
  }
};
