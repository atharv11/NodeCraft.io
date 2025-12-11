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
  BackgroundVariant,
  Controls,
  ControlButton,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ref, set, get } from "firebase/database";
import { realtimeDb, auth } from "./FireBase.js"; 
import { doc, setDoc, getDoc } from "firebase/firestore";
import { DnDProvider } from "./useDnD.js";
import { Sidebar } from "./SideBar.js";
import ButtonEdge from "./ButtonEdge.js";

import Product from "./Product.js";
import Process from "./Process.js";
import Resources from "./Resources.js";

import { onAuthStateChanged } from "firebase/auth";
import Auth from "./Auth.js";

const nodeTypes = {
  product: Product,
  process: Process,
  resources: Resources,
};

const edgeTypes = {
  buttonEdge: ButtonEdge,
};

const initialNodes: Node[] = [
  // {
  //   id: "n1",
  //   position: { x: 0, y: 0 },
  //   data: { amount: "Serial number #1" },
  //   type: "Product",
  // },
  // {
  //   id: "n2",
  //   position: { x: 200, y: 50 },
  //   data: { ItemName: "Mother Board", Quantity: 1 },
  //   type: "Process",
  // },
  // {
  //   id: "n3",
  //   position: { x: 200, y: 100 },
  //   data: { ItemName: "RAM", Quantity: 2 },
  //   type: "Process",
  // },
  // {
  //   id: "n4",
  //   position: { x: 200, y: 150 },
  //   data: { ItemName: "Storage (SSD)", Quantity: 1 },
  //   type: "Process",
  // },
  // {
  //   id: "n4.1",
  //   position: { x: 200, y: 200 },
  //   data: { ItemName: "Display Panel", Quantity: 1 },
  //   type: "Process",
  // },
  // {
  //   id: "n5",
  //   position: { x: 350, y: 0 },
  //   data: { name: "Chip" },
  //   type: "Resourcess",
  // },
  // {
  //   id: "n6",
  //   position: { x: 350, y: 50 },
  //   data: { name: "PCB" },
  //   type: "Resourcess",
  // },
  // {
  //   id: "n7",
  //   position: { x: 350, y: 100 },
  //   data: { name: "Heat Spreader" },
  //   type: "Resourcess",
  // },
  // {
  //   id: "n8",
  //   position: { x: 350, y: 150 },
  //   data: { name: "Capacitor" },
  //   type: "Resourcess",
  // },
  // {
  //   id: "n9",
  //   position: { x: 150, y: -50 },
  //   data: { name: "Add component to add in your custom Laptop" },
  //   type: "ResourcesSelect",
  // },
];

function FlowContent() {
  const initialEdges: Edge[] = [];
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  //   LOAD DATA 
  //useEffect(() => {

  //Code to Retrive Data from firebase
  const RetriveData = useCallback(async () => {
  
    try {
      const docRef = ref(realtimeDb, "Nodes and edges");
      const snapshot = await get(docRef);

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

  const onConnect: OnConnect = useCallback(
    async (params) => {
      const updatedEdges = addEdge(
        {
          ...params,
          type: "buttonEdge",
          animated: true,
          style: { strokeWidth: 3, stroke: "#0E6EF7" },
        },
        edges
      );
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
    <div className=" w-screen h-screen bg-[#E6E6E6]">
      <Sidebar />
      <button
        className="cursor-pointer absolute bottom-[2vw] left-[50vw] w-[10vw] h-[5vw] z-50 bg-[#ffffff] rounded-3xl"
        onClick={RetriveData}
      >
        Get your progress
      </button>
      <button
        className="cursor-pointer absolute bottom-[2vw] left-[60vw] w-[10vw] h-[5vw] z-50 bg-[#353535] text-white rounded-3xl"
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
        className="w-screen h-screen "
      >
        <Background
          id="2"
          gap={50}
          color="#878787"
          variant={BackgroundVariant.Cross}
        />
        <Controls
          position="bottom-right"
          className="bg-[white] shadow-4xl   rounded-xl m-4 p-1 overflow-hidden"
        ></Controls>
      </ReactFlow>
    </div>
  );
}

export default function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check Auth Status on Load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser as any);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Show Loading Spinner while checking
  if (loading) return <div className="text-center mt-20 text-xl font-bold">Loading...</div>;

  // 3. Show Login Page if NOT logged in
  if (!user) {
    return <Auth />;
  }

  return (
    <ReactFlowProvider>
      <DnDProvider>
        <FlowContent />
      </DnDProvider>
    </ReactFlowProvider>
  );
}