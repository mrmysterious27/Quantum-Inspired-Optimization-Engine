import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { OptimizationResponse, Node } from '../types';
import { Activity, Zap, CheckCircle, Brain, Target, Map } from 'lucide-react';

interface MetricsProps {
  data: OptimizationResponse | null;
  currentStepIndex: number;
  nodes: Node[];
}

const Metrics: React.FC<MetricsProps> = ({ data, currentStepIndex, nodes }) => {
  // Memoize cumulative calculations to avoid recalculating on every render if not needed
  const { cumulativeTunneling, chartData, latest, isFinished, routeDetails } = useMemo(() => {
    if (!data) return { cumulativeTunneling: 0, chartData: [], latest: null, isFinished: false, routeDetails: [] };

    const sliced = data.iterations.slice(0, currentStepIndex + 1);
    const tunnelingCount = sliced.filter(it => it.tunneling).length;
    
    // Calculate route details for the current displayed route
    const currentRouteIds = data.iterations[currentStepIndex].current_route;
    
    return {
      cumulativeTunneling: tunnelingCount,
      chartData: sliced,
      latest: data.iterations[currentStepIndex],
      isFinished: currentStepIndex === data.iterations.length - 1,
      routeDetails: currentRouteIds
    };
  }, [data, currentStepIndex]);

  if (!data || !latest) {
    return (
      <div className="h-full flex items-center justify-center text-slate-600 flex-col gap-2">
        <Brain className="w-12 h-12 opacity-20" />
        <p>Awaiting Quantum Simulation Data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Summary Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
           <Target className="w-3 h-3" />
           <span className="uppercase tracking-widest">{data.summary.problem_type}</span>
        </div>
        <div>
           NODES: <span className="text-slate-300">{data.summary.total_nodes}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 transition-colors hover:border-slate-600">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-1">
            <Activity className="w-3 h-3" /> Current Energy
          </div>
          <div className="text-xl font-mono text-white">
            {latest.current_energy.toFixed(1)}
          </div>
        </div>
        
        <div className={`p-3 rounded-lg border transition-all duration-300 ${isFinished ? 'bg-qcyan/10 border-qcyan/50' : 'bg-slate-800/50 border-slate-700'}`}>
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-1">
            <CheckCircle className={`w-3 h-3 ${isFinished ? 'text-qcyan' : 'text-slate-500'}`} /> Best Energy
          </div>
          <div className={`text-xl font-mono ${isFinished ? 'text-qcyan' : 'text-qcyan/80'}`}>
            {latest.best_energy.toFixed(1)}
          </div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 transition-colors hover:border-slate-600">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-1">
            <Zap className={`w-3 h-3 ${latest.tunneling ? 'text-white animate-pulse' : 'text-qpurple'}`} /> Tunneling
          </div>
          <div className="text-xl font-mono text-qpurple flex items-baseline gap-1">
            {cumulativeTunneling}
            <span className="text-xs text-slate-500">/ {data.final_result.tunneling_events}</span>
          </div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 transition-colors hover:border-slate-600">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-1">
            <Brain className="w-3 h-3" /> Iterations
          </div>
          <div className="text-xl font-mono text-white">
            {latest.step}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="flex-1 min-h-[150px] bg-slate-900/50 rounded-lg p-4 border border-slate-800 relative group">
        <h3 className="text-xs font-semibold text-slate-400 mb-2 absolute top-4 left-4 z-10 opacity-50 group-hover:opacity-100 transition-opacity">ENERGY MINIMIZATION LANDSCAPE</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="step" 
              stroke="#475569" 
              tick={{fontSize: 10}}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#475569" 
              domain={['auto', 'auto']} 
              tick={{fontSize: 10}}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#f1f5f9', borderRadius: '4px' }}
              itemStyle={{ fontSize: '12px' }}
              cursor={{ stroke: '#334155', strokeWidth: 1 }}
            />
            <Line 
              type="monotone" 
              dataKey="current_energy" 
              stroke="#bc13fe" 
              strokeWidth={1.5} 
              dot={false}
              animationDuration={0}
              name="Current Energy"
              isAnimationActive={false}
            />
            <Line 
              type="stepAfter" 
              dataKey="best_energy" 
              stroke="#00f0ff" 
              strokeWidth={2} 
              dot={false}
              animationDuration={0}
              name="Global Minima"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Route Details Log */}
      <div className="flex-1 bg-slate-900/30 rounded-lg border border-slate-800 overflow-hidden flex flex-col min-h-[150px]">
         <div className="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-900/50">
           <Map className="w-3 h-3 text-qcyan" />
           <span className="text-xs font-bold text-slate-400 uppercase">Current Route Sequence & Distances</span>
         </div>
         <div className="overflow-y-auto p-2 text-xs font-mono space-y-1">
           {routeDetails.map((nodeId, idx) => {
             const nextNodeId = routeDetails[(idx + 1) % routeDetails.length];
             
             // Look up actual nodes to calculate distance and get names
             const currentNode = nodes.find(n => n.id === nodeId);
             const nextNode = nodes.find(n => n.id === nextNodeId);
             
             let distText = "--";
             let currentLabel = `Node ${nodeId}`;
             let nextLabel = `Node ${nextNodeId}`;

             if (currentNode && nextNode) {
               const d = Math.sqrt(Math.pow(currentNode.x - nextNode.x, 2) + Math.pow(currentNode.y - nextNode.y, 2));
               distText = d.toFixed(1);
               if (currentNode.label) currentLabel = currentNode.label;
               if (nextNode.label) nextLabel = nextNode.label;
             }

             return (
               <div key={idx} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800/30">
                  <span className="w-6 text-right opacity-50">{idx + 1}.</span>
                  <div className="flex-1 flex justify-between items-center">
                    <span className={idx === 0 ? "text-green-400 font-bold" : "text-slate-300"}>{currentLabel}</span>
                    <div className="flex items-center gap-1 mx-2 opacity-60">
                      <span className="h-px w-3 bg-slate-500"></span>
                      <span className="text-[10px] text-qcyan">{distText}u</span>
                      <span className="h-px w-3 bg-slate-500"></span>
                      <span className="text-[10px]">→</span>
                    </div>
                    <span className={idx === routeDetails.length - 1 ? "text-green-400" : "text-slate-300"}>
                      {nextLabel} {idx === routeDetails.length - 1 ? '(Ret)' : ''}
                    </span>
                  </div>
               </div>
             );
           })}
         </div>
      </div>

      {/* Explanation Text */}
      <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-800 text-sm text-slate-300 transition-all hover:bg-slate-800/50">
        <div className="flex items-start gap-2">
          <div className="mt-1 min-w-[4px] h-[4px] rounded-full bg-qcyan" />
          <p>
            <span className="text-qcyan font-bold mr-2 uppercase text-xs tracking-wider">Analysis:</span>
            {data.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Metrics;