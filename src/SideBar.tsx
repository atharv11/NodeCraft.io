import { useReactFlow, type XYPosition } from "@xyflow/react";
import { useCallback, useState } from "react";
// NOTE: Assuming this file exists and contains OnDropAction, useDnD, useDnDPosition
import { type OnDropAction, useDnD, useDnDPosition } from "./useDnD.js";
import Button from "@mui/material/Button";
import { signOut } from "firebase/auth";
import { auth } from "./FireBase.js";

// This is a simple ID generator for the nodes.
let id = 0;
const getId = () => `dndnode_${id++}`;

// --- DragGhost Component (Fixed Positioning and Transparency) ---

interface DragGhostProps {
  type: string | null;
}

// The DragGhost component is used to display a ghost node when dragging a node into the flow.
export function DragGhost({ type }: DragGhostProps) {
  const { position } = useDnDPosition(); // Gets the cursor's screen coordinates
  const { isDragging } = useDnD(); // Gets the drag state

  // Ensures we only render when actively dragging
  if (!isDragging || !position) return null;

  return (
    <div
      className={` fixed 
        pointer-events-none 
        z-9999 // Ensures it sits on top of everything
        w-32 h-12 flex items-center justify-center rounded-lg shadow-xl font-bold p-2
        text-white transition duration-75 
        
      `}
      style={{
        // 1. Set the dynamic screen position (left/top MUST be here)
        left: position.x,
        top: position.y,

        // 2. Center the element relative to its top/left position
        transform: `translate(-50%, -50%)`,

        // 3. Control visibility
        opacity: isDragging ? 0.9 : 0,
      }}
    >
      {type ? `${type.charAt(0).toUpperCase() + type.slice(1)}` : "Node"}
    </div>
  );
}

// --- Sidebar Component ---

export function Sidebar() {
  const { onDragStart, isDragging } = useDnD();
  // The type of the node that is being dragged.
  const [type, setType] = useState<string | null>(null);

  const { setNodes , setEdges } = useReactFlow();

  const createAddNewNode = useCallback(
    (nodeType: string ): OnDropAction => {
      return ({ position }: { position: XYPosition }) => {
        // Here, we create a new node and add it to the flow.
        const newNode = {
          id: getId(),
          type: nodeType,
          position,
          data: { label: `${nodeType} node` },
        };

        setNodes((nds) => nds.concat(newNode));
        setType(null);
      };
    },
    [setNodes, setType]
  );
    const createAddNewEdge = useCallback(
    ( edgeTypes:string): OnDropAction => {
      return ({ position }: { position: XYPosition }) => {
        // Here, we create a new node and add it to the flow.
        const newEdge = {
          id: getId(),
          type: edgeTypes,
          position,
          data: { label: `${edgeTypes} node` },
        };

        setNodes((nds) => nds.concat(newEdge));
        setType(null);
      };
    },
    [setNodes, setType]
  );
   // --- 2. LOGOUT FUNCTION ---
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth); 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, []);

  return (
    // Outer container for the sidebar layout
    <div className="fixed bottom-[.05vw]  m-2 z-40 w-[15vw] h-[35vw] ">
      {/* The ghost node will be rendered at pointer position when dragging. 
          It must be rendered inside the provider chain (App -> DnDProvider -> FlowContent -> Sidebar) */}
      {isDragging && <DragGhost type={type} />}

      <aside className="bg-[#333333]    h-full rounded-4xl shadow-xl ">
        <div className=" bg-[#0E6EF7]  w-full h-[7.5vw] mb-4 text-white text-sm rounded-4xl p-4">
          <div className=" w-2 h-2   rounded-full border-[1.15vw] rotate-135 border-white border-t-transparent"></div>
        </div>
        <div className="p-4 ">
          {/* Draggable Node 1: Input */}
          <div
            className="dndnode input bg-[#FFFFFF] p-3 mb-3 rounded-2xl text-[#121710] cursor-grab shadow-md hover:bg-red-700 transition"
            onPointerDown={(event) => {
              setType("Product");
              onDragStart(
                event as React.PointerEvent<HTMLDivElement>,
                createAddNewNode("product")
              );
            }}
          >
            Product
          </div>

          {/* Draggable Node 2: Default */}
          <div
            className="dndnode bg-[#FFFFFF] p-3 mb-3 rounded-2xl  text-[#121710] cursor-grab shadow-md hover:bg-yellow-700 transition"
            onPointerDown={(event) => {
              setType("process");
              onDragStart(
                event as React.PointerEvent<HTMLDivElement>,
                createAddNewNode("process")
              );
            }}
          >
            Process
          </div>

          {/* Draggable Node 3: Output */}
          <div
            className="dndnode output bg-[#FFFFFF] p-3 mb-3 rounded-2xl text-[#121710] cursor-grab shadow-md hover:bg-blue-700 transition"
            onPointerDown={(event) => {
              setType("resources");
              onDragStart(
                event as React.PointerEvent<HTMLDivElement>,
                createAddNewNode("resources"),
                
              );
            }}
          >
            Resources
          </div>
         
        </div>
            <Button className="w-[2vw] h-[2vw] p-[1vw]  " onClick={handleLogout}>Logout</Button>
      </aside>
   
    </div>
  );
}
