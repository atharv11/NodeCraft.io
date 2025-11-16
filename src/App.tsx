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

// Define initial nodes with proper typing
const initialNodes: Node[] = [
  {
    id: "n1",
    position: { x: 0, y: 0 },
    data: { amount: 10 },
    type: "paymentInit",
  },
  {
    id: "n2",
    position: { x: 200, y: 200 },
    data: { currency: "$", country: "United states" },
    type: "paymentCountry",
  },
  {
    id: "n3",
    position: { x: 300, y: 300 },
    data: { currency: "Euro", country: "Germany" },
    type: "paymentCountry",
  },
  {
    id: "n4",
    position: { x: 350, y: 0 },
    data: { name: "PayPal" },
    type: "paymentProviders",
  },
  {
    id: "n5",
    position: { x: 350, y: 50 },
    data: { name: "Stripe" },
    type: "paymentProviders",
  },
  {
    id: "n6",
    position: { x: 350, y: 100 },
    data: { name: "Razorpay" },
    type: "paymentProviders",
  },
  {
    id: "n7",
    position: { x: 350, y: 150 },
    data: { name: "GooglePay" },
    type: "paymentProviders",
  },
  {
    id: "n8",
    position: { x: 100, y: -50 },
    data: { name: "Select your Payment method" },
    type: "paymentProviderSelect",
  },
];

// Initial edges
const initialEdges: Edge[] = [];

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);

  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  return (
    <div className="bg-amber-100" style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
              nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls/>
      </ReactFlow

      >
    </div>
  );
}
