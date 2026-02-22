import React, { useState, useCallback, useEffect , useRef } from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { motion } from "framer-motion";
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

// Firebase imports
import { auth, db } from "./FireBase.js";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Component imports
import { DnDProvider } from "./useDnD.js";
import { Sidebar } from "./SideBar.js";
import ButtonEdge from "./ButtonEdge.js";
import Product from "./Product.js";
import Process from "./Process.js";
import Resources from "./Resources.js";
import Auth from "./Auth.js";
import Dashboard from "./Dashboard.js";

const nodeTypes = {
  product: Product,
  process: Process,
  resources: Resources,
};

const edgeTypes = {
  buttonEdge: ButtonEdge,
};

const initialNodes: Node[] = [];

// --- INTERNAL FLOWCONTENT COMPONENT ---
function FlowContent({ 
  user, 
  projectId, // Added projectId prop
  onBack 
}: { 
  user: User; 
  projectId: string | null; 
  onBack: () => void 
}) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);

  
  const getProjectDocRef = () => {
    if (projectId) {
      // Path for a specific project created via Dashboard
      return doc(db, "users", user.uid, "projects", projectId);
    } else {
      // Path for the "Main Workspace"
      return doc(db, "users", user.uid);
    }
  };

  const RetriveData = useCallback(async () => {
    if (!user) return;

    try {
      const docRef = getProjectDocRef();
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        console.log("Data loaded from:", projectId ? `Project ${projectId}` : "Main Workspace");
      } else {
        console.log("No existing data found at this path.");
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  }, [user, projectId]);

  const SaveData = useCallback(async () => {
    if (!user) return;

    try {
      const docRef = getProjectDocRef();
      await setDoc(
        docRef,
        {
          nodes: nodes,
          edges: edges,
          email: user.email,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
      alert("Saved Successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Save failed.");
    }
  }, [nodes, edges, user, projectId]);

  // // AUTOMATIC LOAD: This loads the data as soon as the editor opens
  // useEffect(() => {
  //   RetriveData();
  // }, [RetriveData]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
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
    [edges]
  );

  return (
    <div className="w-full h-screen bg-[#ffffff]">
      <Sidebar onBack={onBack} />
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4">
        <motion.button
        whileHover={{ 
        scale: 1.1,
        backgroundColor: "#61dafb",
        color: "#000" 
      }}
          className="px-6 py-3 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 cursor-pointer text-sm font-medium"
          onClick={RetriveData}
        >
          Retrieve Data
        </motion.button>
        <motion.button
         whileHover={{ 
        scale: 1.05,
        backgroundColor: "#61dafb",
        color: "#000" 
      }}
          className="px-6 py-3 bg-[#353535] text-white rounded-full shadow-lg hover:bg-black cursor-pointer text-sm font-medium"
          onClick={SaveData}
        >
          Save to Cloud
        </motion.button>
      </div>

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
        <Background gap={50} color="#BDBDBD" variant={BackgroundVariant.Cross} />
        <Controls position="bottom-right" className="bg-white shadow-xl rounded-xl m-4 p-1" />
      </ReactFlow>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnapshot = await getDoc(userDocRef);

          if (!userSnapshot.exists()) {
            await setDoc(userDocRef, {
              name : currentUser.displayName || "Anonymous",
              email: currentUser.email,
              uid: currentUser.uid,
              nodes: [],
              edges: [],
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("Error creating profile:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center   mt-20 text-4xl font-bold"> <ClimbingBoxLoader color="#7f7fff" /></div>;

  if (!user) return <Auth />;

  if (isEditorOpen) {
    return (
      <ReactFlowProvider>
        <DnDProvider>
          <FlowContent 
            user={user} 
            projectId={currentProjectId} 
            onBack={() => {
              setIsEditorOpen(false);
              setCurrentProjectId(null); // Clear ID when closing
            }} 
          />
        </DnDProvider>
      </ReactFlowProvider>
    );
  }

  return (
    <Dashboard 
      user={user} 
      onOpenEditor={(id?: string) => {
        setCurrentProjectId(id || null);
        setIsEditorOpen(true);
      }} 
    />
  );
}