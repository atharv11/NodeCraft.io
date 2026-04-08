import React, { useState, useCallback, useEffect , useRef } from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { motion } from "framer-motion";
import { DndContext, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';

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
import ImportExport from "./import-export.js";
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
  
  const [isDragMode, setIsDragMode] = useState(true); // Default to dragging
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const onSelectionChange = useCallback((params: { nodes: Node[] }) => {
  const newIds = (params.nodes ?? []).map((n) => n.id);
  
  setSelectedNodeIds((prev) => {
    if (prev.length !== newIds.length) return newIds;
    const isSame = prev.every((id, index) => id === newIds[index]);
    if (isSame) return prev;
    return newIds;
  });
}, []);
 // This tells dnd-kit to listen for both mouse and touch!
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      // Press for 250ms before dragging starts (prevents accidental drags while scrolling)
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

 const isValidConnection = useCallback((edge: Edge | Connection) => {
  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  if (!sourceNode || !targetNode) return false;


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
    <DndContext sensors={sensors}>
    {/* I added 'relative' to the wrapper div below so the absolute positioning of the buttons anchors correctly */}
    <div className="w-full h-screen bg-[#ffffff] relative"> 
      <Sidebar onBack={onBack} user={user} projectName={projectName || "Untitled Project"} />

      {/* NEW: Import/Export Buttons mapped to the top right */}
      <ImportExport 
        nodes={nodes} 
        edges={edges} 
        setNodes={setNodes} 
        setEdges={setEdges} 
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 w-full p-4 z-50 flex justify-center">

  <div className="opacity-75 hover:opacity-100 duration-700 flex flex-col sm:flex-row gap-2 w-full max-content sm:max-w-none sm:w-auto bg-white/50 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-2 rounded-2xl sm:p-0">
    
    <motion.button
     initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.05 }} // Stagger them if you have multiple buttons
  whileHover={{ 
    scale: 1.05, 
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
    filter: "brightness(2.1)" // Makes the button slightly brighter
  }}
  
      className="px-2 py-2 bg-white border cursor-pointer border-gray-300 rounded-xl shadow-lg text-[8px] sm:text-sm font-bold uppercase tracking-tight"
      onClick={RetriveData}
      title="click to Get progress from cloud"
    >
      Retrieve Data
    </motion.button>

    <motion.button
      initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.05 }} // Stagger them if you have multiple buttons
  whileHover={{ 
    scale: 1.05, 
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
    filter: "brightness(2.1)" // Makes the button slightly brighter
  }}
      className="px-2 py-2 cursor-pointer bg-white border border-gray-300 rounded-xl shadow-lg text-[8px] sm:text-sm font-bold uppercase tracking-tight"
      onClick={saveSelectionAsArticle}
     title="Click to save the selected Nodes and edges"
    >
      Save Selection
    </motion.button>

    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }} // Stagger them if you have multiple buttons
      whileHover={{ 
    scale: 1.05, 
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
    filter: "brightness(2.1)" // Makes the button slightly brighter
  }}
      className="px-2 py-2 bg-[#353535] cursor-pointer text-white rounded-xl shadow-lg text-[8px] sm:text-sm font-bold uppercase tracking-tight"
      onClick={SaveData}
      title="click to save progress on cloud"
    >
      Save to Cloud
    </motion.button>
    <motion.button 
     initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }} // Stagger them if you have multiple buttons
      whileHover={{ 
    scale: 1.05, 
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
    filter: "brightness(2.1)" }}// Makes the button slightly brighter
  onClick={() => setIsDragMode(!isDragMode)}
  title="switch between selection mode or drag mode"
  className="DragTool cursor-pointer border rounded-xl shadow-lg font-bold bg-white py-2 px-4  {isDragMode ? 'active-button-style' : 'inactive-style'} "
>
  {isDragMode ? 'DRAG MODE ACTIVE' : 'SWITCH TO DRAG'}
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
        onSelectionChange={onSelectionChange}
        isValidConnection={isValidConnection}
        // When isDragMode is true, selection is disabled, and panning is enabled
        panOnDrag={isDragMode}
        selectionOnDrag={!isDragMode}
  
        //  visually change the cursor
        // code 
        style={{ cursor: isDragMode ? 'grab' : 'crosshair' }}
  
      >
        <Background
          gap={50}
          color="#BDBDBD"
          variant={BackgroundVariant.Cross}
        />
        <Controls
          position="bottom-right"
          className="bg-white shadow-xl rounded-xl nodrag nopan z-9999 m-4 p-1"
        />
      </ReactFlow>
    </div>
    </DndContext>
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
      
      if (currentUser && !currentUser.emailVerified) {
        // If the user exists but hasn't clicked the email link yet
        setUser(null); 
        setLoading(false);
        return;
      }

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
