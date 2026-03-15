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
  useNodesState,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlowProvider,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Firebase imports
import { auth, db } from "./FireBase.js";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

// Component imports
import { DnDProvider } from "./useDnD.js";
import { Sidebar } from "./SideBar.js";
import ButtonEdge from "./ButtonEdge.js";
import Product from "./Product.js";
import Process from "./Process.js";
import Resources from "./Resources.js";
import Auth from "./Auth.js";
import Dashboard from "./Dashboard.js";
import { nanoid } from "nanoid";

const nodeTypes = {
  product: Product,
  process: Process,
  resources: Resources,
};

// ... inside your component


const edgeTypes = {
  buttonEdge: ButtonEdge,
};

const initialNodes: Node[] = [];

// --- INTERNAL FLOWCONTENT COMPONENT ---
function FlowContent({
  user,
  projectId,
  projectName,
  onBack,
}: {
  user: User;
  projectId: string | null;
  projectName: string;
  onBack: () => void;
}) {
  
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
 
  
 const isValidConnection = useCallback((edge: Edge | Connection) => {
  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  if (!sourceNode || !targetNode) return false;

  // Ensure these match the 'type' property you gave your nodes
  const sourceType = sourceNode.type as string; 
  const targetType = targetNode.type as string;

  // Defining the rules exactly as they appear in the JSON
  const rules: Record<string, Record<string, string | null>> = {
    product: {
      product: "consists of",
      process: "input for",
      resources: null,
    },
    process: {
      product: "outputs",
      process: "followed by",
      resources: "executed by",
    },
    resources: {
      product: null,
      process: null,
      resources: "consists of",
    },
  };

  // Check if the connection is allowed (not null)
  const isAllowed = rules[sourceType]?.[targetType] !== null;

  if (!isAllowed) {
    console.warn(`Connection from ${sourceType} to ${targetType} is not allowed!`);
  }

  return isAllowed;
}, [nodes]);
  // HELPER: This creates the correct path based on whether a project is open
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
        setNodes((data as any).nodes || []);
        setEdges((data as any).edges || []);
        console.log(
          "Data loaded from:",
          projectId ? `Project ${projectId}` : "Main Workspace"
        );
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

  // NEW: Save currently selected nodes + edges as an Article (subgraph)
  const saveSelectionAsArticle = useCallback(async () => {
    if (!user) return;

    if (!selectedNodeIds.length) {
      alert("Please select at least one node to save as an article.");
      return;
    }

    const name = window.prompt(
      "Enter a name for this article (subgraph):",
      "New Article"
    );
    if (!name) return;

    // 1. Get selected nodes
    const selectedSet = new Set(selectedNodeIds);
    const subNodes = nodes.filter((n) => selectedSet.has(n.id));

    // 2. Get edges where both ends are in the selected nodes
    const subEdges = edges.filter(
      (e) =>
        selectedSet.has(e.source as string) &&
        selectedSet.has(e.target as string)
    );

    if (!subNodes.length) {
      alert("No valid nodes selected for article.");
      return;
    }

    // 3. Normalize positions so article is position-independent
    const minX = Math.min(
      ...subNodes.map((n) => (n.position?.x ?? 0))
    );
    const minY = Math.min(
      ...subNodes.map((n) => (n.position?.y ?? 0))
    );

    const normalizedNodes = subNodes.map((n) => ({
      ...n,
      position: {
        x: (n.position?.x ?? 0) - minX,
        y: (n.position?.y ?? 0) - minY,
      },
    }));

    // 4. Save to Firestore: users/{uid}/articles/{articleId}
    const articleId = nanoid();
    const articleRef = doc(
      collection(db, "users", user.uid, "articles"),
      articleId
    );

    try {
      await setDoc(articleRef, {
        name,
        description: "",
        nodes: normalizedNodes,
        edges: subEdges,
        createdAt: serverTimestamp(),
      });

      alert("Article (subgraph) saved successfully!");
    } catch (err) {
      console.error("Error saving article:", err);
      alert("Failed to save article.");
    }
  }, [user, nodes, edges, selectedNodeIds]);


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
      <Sidebar onBack={onBack} user={user} projectName={projectName || "Untitled Project"} />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 w-full p-4 z-50 pointer-events-none flex justify-center">
  
  {/* The Button Group: 
    - pointer-events-auto turns clicking back ON for the buttons themselves
    - flex-col for mobile (stacked)
    - sm:flex-row for desktop (side-by-side)
  */}
  <div className="pointer-events-auto flex flex-col sm:flex-row gap-2 w-full max-w-[280px] sm:max-w-none sm:w-auto bg-white/50 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-2 rounded-2xl sm:p-0">
    
    <motion.button
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-lg text-[11px] sm:text-sm font-bold uppercase tracking-tight"
      onClick={RetriveData}
    >
      Retrieve Data
    </motion.button>

    <motion.button
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-lg text-[11px] sm:text-sm font-bold uppercase tracking-tight"
      onClick={saveSelectionAsArticle}
    >
      Save Selection
    </motion.button>

    <motion.button
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 bg-[#353535] text-white rounded-xl shadow-lg text-[11px] sm:text-sm font-bold uppercase tracking-tight"
      onClick={SaveData}
    >
      Save to Cloud
    </motion.button>
    
  </div>
</div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        
      
        onSelectionChange={(params) => {
          const selected = (params.nodes ?? []).map((n) => n.id);
          setSelectedNodeIds(selected);
        }}
        // ↓ Optional: always allow box-selection without needing Shift
        selectionOnDrag={true}
        panOnDrag={false}          // so drags create selection instead of panning
        className="w-screen h-screen"
      >
        <Background
          gap={50}
          color="#BDBDBD"
          variant={BackgroundVariant.Cross}
        />
        <Controls
          position="bottom-right"
          className="bg-white shadow-xl rounded-xl m-4 p-1"
        />
      </ReactFlow>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(
    null
  );
  const [currentProjectName, setCurrentProjectName] = useState<string>("");

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
              name: currentUser.displayName || "Anonymous",
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

  if (loading)
    return (
      <div className="flex items-center justify-center   mt-20 text-4xl font-bold">
        {" "}
        <ClimbingBoxLoader color="#7f7fff" />
      </div>
    );

  if (!user) return <Auth />;

  if (isEditorOpen) {
    return (
      <ReactFlowProvider>
        <DnDProvider>
          <FlowContent
            user={user}
            projectId={currentProjectId}
            projectName={currentProjectName}
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
      onOpenEditor={(id?: string , name?: string) => {
        setCurrentProjectId(id || null);
        setCurrentProjectName(name || "Main Workspace");
        setIsEditorOpen(true);
      }}
    />
  );
}
