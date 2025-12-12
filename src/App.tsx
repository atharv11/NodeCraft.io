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
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

//Firebase imports
import { auth, realtimeDb } from "./FireBase.js"; 
import { ref, set, get } from "firebase/database"; // Realtime DB imports
import { onAuthStateChanged, type User } from "firebase/auth";

import { DnDProvider } from "./useDnD.js";
import { Sidebar } from "./SideBar.js";
import ButtonEdge from "./ButtonEdge.js";

import Product from "./Product.js";
import Process from "./Process.js";
import Resources from "./Resources.js";
import Auth from "./Auth.js";

const nodeTypes = {
  product: Product,
  process: Process,
  resources: Resources,
};

const edgeTypes = {
  buttonEdge: ButtonEdge,
};
//intial nodes set to null
const initialNodes: Node[] = [];


function FlowContent({ user }: { user: User }) {
  const initialEdges: Edge[] = [];
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // Retrieve Data from Realtime Database 
  const RetriveData = useCallback(async () => {
    try {
      // Path: users/{user.uid}
      const dbRef = ref(realtimeDb, `users/${user.uid}`);
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("Retrieved data from RTDB:", data);

        const RetrievedNodes = data.nodes || [];
        const RetrievedEdges = data.edges || [];

        setNodes(RetrievedNodes);
        setEdges(RetrievedEdges);
        alert("Data Restored from Realtime Database!");
      } else {
        console.log("No data found for this user in RTDB.");
      }
    } catch (error) {
      console.error("Error retrieving data from RTDB:", error);
    }
  }, [user, setNodes, setEdges]);

  //  Save Data to Realtime Database ---
  const SaveData = useCallback(async () => {
    try {
      const dbRef = ref(realtimeDb, `users/${user.uid}`); 

      await set(dbRef, {
        nodes: nodes,
        edges: edges,
        email: user.email, // Storing user details alongside flow data
        lastUpdated: new Date().toISOString()
      });
      
      console.log("Saved to Realtime Database!");
      alert("Data Saved to Realtime Database!");
    } catch (error) {
      console.error("Error saving to RTDB:", error);
      alert("Failed to save data.");
    }
  }, [nodes, edges, user]);

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
    },
    [edges, setEdges]
  );

  return (
    <div className="w-screen h-screen bg-[#E6E6E6]">
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
        className="w-screen h-screen"
      >
        <Background
          id="2"
          gap={50}
          color="#878787"
          variant={BackgroundVariant.Cross}
        />
        <Controls
          position="bottom-right"
          className="bg-[white] shadow-4xl rounded-xl m-4 p-1 overflow-hidden"
        ></Controls>
      </ReactFlow>
    </div>
  );
}

// Ensure App component uses the correct typing for state (User | null)

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // --- Optional: Initialize data structure in RTDB on first login ---
        // This is done automatically by SaveData, but kept here for completeness
        try {
          const dbRef = ref(realtimeDb, `users/${currentUser.uid}`);
          const snapshot = await get(dbRef);

          if (!snapshot.exists()) {
             // Initialize basic structure if it doesn't exist
             await set(dbRef, {
                email: currentUser.email,
                nodes: [], 
                edges: [],
                createdAt: new Date().toISOString(),
              });
              console.log("RTDB profile created");
          }
        } catch (err) {
          console.error("Error creating RTDB profile:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center mt-20 text-xl font-bold">Loading...</div>;

  if (!user) {
    return <Auth />;
  }

  return (
    <ReactFlowProvider>
      <DnDProvider>
        <FlowContent user={user} />
      </DnDProvider>
    </ReactFlowProvider>
  );
}