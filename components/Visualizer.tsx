import React, { useMemo } from 'react';
import { Node } from '../types';

interface VisualizerProps {
  nodes: Node[];
  route: number[] | null;
  bestRoute: number[] | null;
  tunneling: boolean;
  startNodeId: number;
}

const Visualizer: React.FC<VisualizerProps> = ({ nodes, route, bestRoute, tunneling, startNodeId }) => {
  const pathD = useMemo(() => {
    if (!route || route.length === 0) return '';
    const points = route.map(idx => {
      const n = nodes.find(node => node.id === idx);
      return n ? `${n.x},${n.y}` : '';
    }).filter(Boolean);
    return `M ${points.join(' L ')} Z`; // Z closes the loop for TSP
  }, [route, nodes]);

  const bestPathD = useMemo(() => {
      if (!bestRoute || bestRoute.length === 0) return '';
      const points = bestRoute.map(idx => {
        const n = nodes.find(node => node.id === idx);
        return n ? `${n.x},${n.y}` : '';
      }).filter(Boolean);
      return `M ${points.join(' L ')} Z`;
    }, [bestRoute, nodes]);

  return (
    <div className="w-full h-full relative bg-qdark overflow-hidden rounded-xl border border-slate-800 shadow-inner">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
          backgroundSize: '4% 4%',
        }}
      />
      
      {/* Tunneling Effect Overlay - Screen Flash */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 bg-qpurple/5 mix-blend-screen ${tunneling ? 'opacity-100' : 'opacity-0'}`} />

      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        className="w-full h-full absolute inset-0 p-4"
        style={{ padding: '2rem' }} // internal padding to keep nodes off edge
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Arrow Marker for Direction - Made Smaller */}
          <marker
            id="arrowhead"
            viewBox="0 0 4 4"
            refX="2"
            refY="2"
            markerWidth="2.5" 
            markerHeight="2.5"
            orient="auto"
          >
            <path d="M 0 0 L 4 2 L 0 4 z" fill={tunneling ? '#bc13fe' : '#00f0ff'} />
          </marker>
        </defs>

         {/* Best Route Ghost */}
         {bestPathD && (
          <path
            d={bestPathD}
            fill="none"
            stroke="#00f0ff"
            strokeWidth="0.3"
            strokeOpacity="0.3"
            strokeDasharray="1 1"
          />
        )}

        {/* Current Active Route - Main Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={tunneling ? '#bc13fe' : '#00f0ff'}
            strokeWidth={tunneling ? "0.6" : "0.4"}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300 ease-linear"
            filter="url(#glow)"
          />
        )}

        {/* Directional Arrows Layer 
            We draw invisible path segments from Start to Midpoint of each leg 
            and attach a marker at the end (which is the midpoint).
        */}
        {route && route.map((nodeId, idx) => {
          const nextIdx = (idx + 1) % route.length;
          const nextNodeId = route[nextIdx];
          const n1 = nodes.find(n => n.id === nodeId);
          const n2 = nodes.find(n => n.id === nextNodeId);
          if (!n1 || !n2) return null;

          // Calculate Midpoint
          const mx = (n1.x + n2.x) / 2;
          const my = (n1.y + n2.y) / 2;

          return (
            <path
              key={`arrow-${idx}`}
              d={`M ${n1.x} ${n1.y} L ${mx} ${my}`}
              stroke="transparent"
              fill="none"
              markerEnd="url(#arrowhead)"
              className="pointer-events-none"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isStart = node.id === startNodeId;
          const isActive = route && route.indexOf(node.id) === 0; // Visual check for animation current start

          return (
            <g key={node.id} className="transition-all duration-500 group">
              {/* Start Node Indicator Ring */}
              {isStart && (
                 <circle
                   cx={node.x}
                   cy={node.y}
                   r="3"
                   fill="none"
                   stroke="#22c55e"
                   strokeWidth="0.2"
                   strokeDasharray="1 0.5"
                   className="opacity-50 animate-pulse"
                 >
                 </circle>
              )}

              {/* Tunneling Excitation Ring */}
              {tunneling && (
                 <circle
                 cx={node.x}
                 cy={node.y}
                 r="2.5"
                 fill="none"
                 stroke="#bc13fe"
                 strokeWidth="0.3"
                 className="opacity-70 animate-ping"
                 style={{ animationDuration: '1.5s' }}
               />
              )}

              <circle
                cx={node.x}
                cy={node.y}
                r={isStart ? "2" : "1.5"}
                fill={isStart ? "#22c55e" : "#050510"}
                stroke={isStart ? "#fff" : (tunneling ? "#bc13fe" : "#e2e8f0")}
                strokeWidth="0.5"
                className="hover:stroke-qcyan transition-colors"
              />
              
              {/* Active Route Dot (animation) */}
               <circle
                cx={node.x}
                cy={node.y}
                r="0.5"
                fill={isActive ? (tunneling ? '#bc13fe' : '#00f0ff') : '#64748b'} 
              />
              
              {node.label ? (
                <text
                  x={node.x}
                  y={node.y - (isStart ? 3.5 : 3)}
                  fontSize="2.5"
                  fill={isStart ? "#4ade80" : "#94a3b8"}
                  textAnchor="middle"
                  className={`pointer-events-none select-none ${isStart ? 'font-bold' : ''}`}
                  style={{textShadow: '0 1px 2px #000'}}
                >
                  {node.label}
                </text>
              ) : (
                <text
                  x={node.x}
                  y={node.y - (isStart ? 3 : 2.5)}
                  fontSize="2"
                  fill={isStart ? "#4ade80" : "#94a3b8"}
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                >
                  {node.id}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {tunneling && (
        <div className="absolute top-4 right-4 bg-qpurple/20 border border-qpurple text-qpurple px-3 py-1 rounded-full text-xs font-bold animate-pulse backdrop-blur-sm">
          QUANTUM TUNNELING EVENT
        </div>
      )}
    </div>
  );
};

export default Visualizer;