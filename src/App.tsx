import { useState, useCallback, useEffect } from "react";
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
import { ref, set, get } from "firebase/database";
import { realtimeDb } from "./FireBase.js"; // Ensure this matches your file name

// Make sure these imports match your actual filenames
import PaymentInit from "./PaymentInit.js";
import PaymentCountry from "./PaymentCountry.js";
import PaymentProviders from "./PaymentProviders.js";
import PaymentProviderSelect from "./PaymentProviderSelect.js";

const nodeTypes = {
  paymentInit: PaymentInit,
  paymentCountry: PaymentCountry,
  paymentProviders: PaymentProviders,
  paymentProviderSelect: PaymentProviderSelect,
};

const edgeTypes = {};

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

const initialEdges: Edge[] = [];

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // --- 1. LOAD DATA (useEffect must be TOP LEVEL) ---
  //useEffect(() => {

  //Code to Retrive Data from firebase
  const RetriveData = useCallback(async () => {
    try {
      const dbRef = ref(realtimeDb, "Nodes and edges");
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const dbGet = snapshot.val();
        console.log("Retrieved data:", dbGet);

        const RetrievedNodes = dbGet.nodes || [];
        const RetrievedEdges = dbGet.edges || [];

        setNodes(RetrievedNodes);
        setEdges(RetrievedEdges);
        alert("Data Restored!");
      } else {
        console.log("No data found.");
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  }, [setNodes, setEdges]);

  //RetriveData();
  //}, []);

  const SaveData = useCallback(async () => {
    try {
      const dbRef = ref(realtimeDb, "Nodes and edges");
      await set(dbRef, {
        nodes: nodes,
        edges: edges,
      });
      console.log("Saved to Realtime Database!");
      alert("Data Saved!");
    } catch (error) {
      console.error("Error saving:", error);
    }
  }, [nodes, edges]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // --- 2. SAVE DATA (onConnect is a sibling of useEffect) ---
  const onConnect: OnConnect = useCallback(
    async (params) => {
      const updatedEdges = addEdge({ ...params, animated: true }, edges);
      setEdges(updatedEdges);

      // 
      const targetId = params.target;
      const countToTarget = updatedEdges.filter(
        (e) => e.target === targetId
      ).length;

      const targetNode = nodes.find((n) => n.id === params.target);
      if (targetNode) {
        const targetInfo =
          targetNode.data.label ||
          targetNode.data.ItemName ||
          targetNode.data.amount ||
          targetNode.data.name ||
          "Unknown Source";
        console.log(`Total edges connected to ${targetInfo}: ${countToTarget}`);
      }

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
    },
    [edges, nodes, setEdges]
  );

  return (
    <div className=" w-screen h-screen bg-amber-50">
      <button
        className="cursor-pointer absolute bottom-[2vw] left-[50vw] w-[10vw] h-[5vw] z-50 bg-amber-600 rounded-3xl"
        onClick={RetriveData}
      >
        Get  your progress
      </button>
      <button
        className="cursor-pointer absolute bottom-[2vw] left-[60vw] w-[10vw] h-[5vw] z-50 bg-amber-600 rounded-3xl"
        onClick={SaveData}
      >
        Save to the Cloud
      </button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        className="w-screen h-screen bg-red-500"
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
