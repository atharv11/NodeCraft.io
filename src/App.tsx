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
import { auth, db, realtimeDb } from "./FireBase.js";
import { ref, set, get } from "firebase/database"; // Realtime DB imports
import { onAuthStateChanged, type User } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore"; 
import { DnDProvider } from "./useDnD.js";
import { Sidebar } from "./SideBar.js";
import ButtonEdge from "./ButtonEdge.js";

import Product from "./Product.js";
import Process from "./Process.js";
import Resources from "./Resources.js";
import Auth from "./Auth.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Dashboard from "./Dashboard.js";
import { FaArrowLeft } from "react-icons/fa";


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

function FlowContent({ user, onBack }: { user: User; onBack: () => void }) {
  const initialEdges: Edge[] = [];
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // Retrieve Data from Realtime Database
  const RetriveData = useCallback(async () => {
    if (!user) return; // Guard clause to ensure user exists

    try {
      // Create a reference to the specific user's document

      const docRef = doc(db, "users", user.uid);

      // Fetch the document snapshot
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // 3. Extract the data using .data()
        const data = docSnap.data();
        console.log("Retrieved data from Firestore:", data);

        // 4. Set your nodes and edges state
        const RetrievedNodes = data.nodes || [];
        const RetrievedEdges = data.edges || [];

        setNodes(RetrievedNodes);
        setEdges(RetrievedEdges);
        alert("Data Restored from Firestore!");
      } else {
        console.log("No document found for this user in Firestore.");
      }
    } catch (error) {
      console.error("Error retrieving data from Firestore:", error);
    }
  }, [user, setNodes, setEdges]);

  //  Save Data to Realtime Database
  const SaveData = useCallback(async () => {
    if (!user) {
      alert("No user logged in.");
      return;
    }

    try {
      // Create a reference to the user's specific document
      // Path: users/{user.uid}
      const userDocRef = doc(db, "users", user.uid);

      //  Use setDoc to write the data
      // setDoc with { merge: true } works like an update if the doc exists,
      // or creates it if it doesn't.
      await setDoc(
        userDocRef,
        {
          nodes: nodes,
          edges: edges,
          email: user.email,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );

      console.log("Saved to Cloud Firestore!");
      alert("Data Saved to the Cloud!");
    } catch (error) {
      console.error("Error saving to Firestore:", error);
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
    <div className="w-screen h-screen bg-[#ffffff]">
      <Sidebar onBack={onBack}   />
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
          color="#BDBDBD"
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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          // 1. Create a reference to the user document in the "users" collection
          const userDocRef = doc(db, "users", currentUser.uid);

          // 2. Check if the document already exists
          const userSnapshot = await getDoc(userDocRef);

          if (!userSnapshot.exists()) {
            // 3. Initialize the document if it doesn't exist
            await setDoc(userDocRef, {
              email: currentUser.email,
              uid: currentUser.uid,
              nodes: [],
              edges: [],
              createdAt: new Date().toISOString(),
            });
            console.log("Firestore user profile created");
          }
        } catch (err) {
          console.error("Error creating Firestore profile:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="text-center mt-20 text-xl font-bold">Loading...</div>
    );

  if (!user) {
    //if the user is nor present of not signed in then go to Auth component
    return <Auth />;
  }

  if (isEditorOpen) {
    return (
      <ReactFlowProvider>
        <DnDProvider>
          <FlowContent user={user}  onBack={() => setIsEditorOpen(false)} />
        </DnDProvider>
      </ReactFlowProvider>
    );
    
  }
  return (
  <Dashboard 
    user={user} 
    onOpenEditor={() => setIsEditorOpen(true)} 
  />
);
}
