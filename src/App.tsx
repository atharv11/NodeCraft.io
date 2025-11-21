import { useState, useCallback } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  Background,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import PaymentInit from "./PaymentInit.jsx";
import PaymentCountry from "./PaymentCountry.jsx";
import PaymentProviders from "./PaymentProviders.js";
import PaymentProviderSelect from "./PaymentProviderSelect.js";

// Define node types mapping
const nodeTypes = {
  paymentInit: PaymentInit,
  paymentCountry: PaymentCountry,
  paymentProviders: PaymentProviders,
  paymentProviderSelect: PaymentProviderSelect,
};

// Define edge types mapping
const edgeTypes = {};

// Define initial nodes
const initialNodes: Node[] = [
  {
    id: "n1",
    position: { x: 0, y: 0 },
    data: { amount: "Serial number #1" },
    type: "paymentInit",
  },
  {
    id: "n2",
    position: { x: 200, y: 50 },
    data: { ItemName: "Mother Board", Quantity: 1 },
    type: "paymentCountry",
  },
  {
    id: "n3",
    position: { x: 200, y: 100 },
    data: { ItemName: "RAM", Quantity: 2 },
    type: "paymentCountry",
  },
  {
    id: "n4",
    position: { x: 200, y: 150 },
    data: { ItemName: "Storage (SSD)", Quantity: 1 },
    type: "paymentCountry",
  },
  {
    id: "n4.1",
    position: { x: 200, y: 200 },
    data: { ItemName: "Display Panel", Quantity: 1 },
    type: "paymentCountry",
  },
  {
    id: "n5",
    position: { x: 350, y: 0 },
    data: { name: "Chip" },
    type: "paymentProviders",
  },
  {
    id: "n6",
    position: { x: 350, y: 50 },
    data: { name: "PCB" },
    type: "paymentProviders",
  },
  {
    id: "n7",
    position: { x: 350, y: 100 },
    data: { name: "Heat Spreader" },
    type: "paymentProviders",
  },
  {
    id: "n8",
    position: { x: 350, y: 150 },
    data: { name: "Capacitor" },
    type: "paymentProviders",
  },
  {
    id: "n9",
    position: { x: 150, y: -50 },
    data: { name: "Add component to add in your custom Laptop" },
    type: "paymentProviderSelect",
  },
];

// Initial edges
const initialEdges: Edge[] = [
  { id: "n1-2", source: "n1", target: "n2", animated: true },
  { id: "n1-3", source: "n1", target: "n3", animated: true },
  { id: "n1-4", source: "n1", target: "n4", animated: true },
  { id: "n1-4.1", source: "n1", target: "n4.1", animated: true },

  { id: "n2-5", source: "n2", target: "n5", animated: true },
  { id: "n2-6", source: "n2", target: "n6", animated: true },
  { id: "n2-7", source: "n2", target: "n7", animated: true },
  { id: "n2-8", source: "n2", target: "n8", animated: true },
];

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        // Add a new edge
        const updatedEdges = addEdge({ ...params, animated: true }, eds);

        const targetId = params.target;
        // Count connections going INTO the target
        const countToTarget = updatedEdges.filter(
          (e) => e.target === targetId
        ).length;
       const targetNode = updatedEdges.find((n)=>n.id===params.target)
       if(targetNode){
        const targetInfo= targetNode.data.label
          
       }
       console.log(`Total edges connected to ${targetId}: ${countToTarget}`);
      

        // Get source node info
        const sourceNode = nodes.find((n) => n.id === params.source);

        if (sourceNode) {
          const sourceInfo =
            sourceNode.data.label ||
            sourceNode.data.ItemName ||
            sourceNode.data.amount ||
            sourceNode.data.name ||
            "Unknown Source";

          console.log(`Connected Source: ${sourceInfo}`);
        }

        return updatedEdges;
      });
    },
    [nodes]
  );

  return (
    <div className="w-screen h-screen bg-amber-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        className="w-[500px] h-screen bg-red-500"
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
