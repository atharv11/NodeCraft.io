import React, { useState, useCallback, useEffect } from "react";
import { ClimbingBoxLoader } from "react-spinners";
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

const edgeTypes = {
  buttonEdge: ButtonEdge,
};

const initialNodes: Node[] = [];

// --- INTERNAL FLOWCONTENT COMPONENT ---
function FlowContent({
  user,
  projectId, // Added projectId prop
  onBack,
}: {
  user: User;
  projectId: string | null;
  onBack: () => void;
}) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

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
    <div className="w-screen h-screen bg-[#ffffff]">
      <Sidebar onBack={onBack} user={user} />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4">
        <button
          className="px-6 py-3 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 cursor-pointer text-sm font-medium"
          onClick={RetriveData}
        >
          Retrieve Data
        </button>

        <button
          className="px-6 py-3 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 cursor-pointer text-sm font-medium"
          onClick={saveSelectionAsArticle}
        >
          Save Selection as Article
        </button>

        <button
          className="px-6 py-3 bg-[#353535] text-white rounded-full shadow-lg hover:bg-black cursor-pointer text-sm font-medium"
          onClick={SaveData}
        >
          Save to Cloud
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // ↓ This callback is already in your code
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
