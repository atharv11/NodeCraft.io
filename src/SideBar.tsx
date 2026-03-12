import { useReactFlow, type XYPosition } from "@xyflow/react";
import { useCallback, useState } from "react";
import { type OnDropAction, useDnD, useDnDPosition } from "./useDnD.js";
import Button from "@mui/material/Button";
import { FaArrowLeft } from "react-icons/fa";
import Dashboard from "./Dashboard.js";
import { nanoid } from "nanoid";
import type { User } from "firebase/auth";
import { ArticlesSection } from"./Article.js"; // New

// This is a simple ID generator for the nodes.
let id = 0;

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
        w-32 h-12 flex items-center justify-center rounded-lg shadow-xl  p-2
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
interface SidebarProps {
  onBack: () => void;
  user: User;
  projectName: string; // <--- ADD THIS
}

export function Sidebar({ onBack, user , projectName }: SidebarProps) {
  const { onDragStart, isDragging } = useDnD();
  // The type of the node that is being dragged.
  const [type, setType] = useState<string | null>(null);

  const { setNodes, setEdges } = useReactFlow();

  const createAddNewNode = useCallback(
    (nodeType: string): OnDropAction => {
      return ({ position }: { position: XYPosition }) => {
        // here the new node is created every time dragged from the sidebar window
        const newNode = {
          id: nanoid(),
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
    (edgeTypes: string): OnDropAction => {
      return ({ position }: { position: XYPosition }) => {
        // this is wehre the new edge is created
        const newEdge = {
          id: nanoid(),
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

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[16vw] h-[38vw] min-w-[180px]">
      {/* Render the ghost node during drag */}
      {isDragging && <DragGhost type={type} />}

      <aside className=" bg-[linear-gradient(to_bottom,#E0F2FE,transparent)] border-r-2  border-white  flex flex-col gap-2 h-full rounded-2xl shadow-2xl  overflow-hidden">
        {/* Blue Header Section */}
        <div className="relative  p-4 h-[6vw] min-h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Your custom spinning/rotated icon */}
            <span className="text-blue-950 font-bold   text-xl tracking-wide">
              {projectName || "Untitled Project"}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
          <p className="text-[#888888] text-[10px] uppercase font-bold tracking-widest mb-1">
            Components
          </p>

          {/* Draggable Node 1: Product */}
          <div
            className="group flex items-center justify-between bg-blue-300 p-3 rounded-xl text-gray-800 cursor-grab border border-transparent  hover:bg-blue-400 transition-all duration-200 shadow-sm"
            onPointerDown={(event) => {
              setType("Product");
              onDragStart(
                event as React.PointerEvent<HTMLDivElement>,
                createAddNewNode("product")
              );
            }}
          >
            <span className="text-sm font-medium">Product</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#0E6EF7] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Draggable Node 2: Process */}
          <div
            className="group flex items-center justify-between bg-blue-200 p-3 rounded-xl text-gray-800 cursor-grab border border-transparent  hover:bg-blue-300 transition-all duration-200 shadow-sm"
            onPointerDown={(event) => {
              setType("process");
              onDragStart(
                event as React.PointerEvent<HTMLDivElement>,
                createAddNewNode("process")
              );
            }}
          >
            <span className="text-sm font-medium">Process</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#0E6EF7] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Draggable Node 3: Resources */}
          <div
            className="group flex items-center justify-between bg-blue-100 p-3 rounded-xl text-gray-800 cursor-grab border border-transparent  hover:bg-blue-200 transition-all duration-200 shadow-sm"
            onPointerDown={(event) => {
              setType("resources");
              onDragStart(
                event as React.PointerEvent<HTMLDivElement>,
                createAddNewNode("resources")
              );
            }}
          >
            <span className="text-sm font-medium">Resources</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#0E6EF7] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* --- NEW: Articles Section --- */}
          <div className="mt-4">
            <p className="text-[#888888] text-[10px] uppercase font-bold tracking-widest mb-1">
              Articles
            </p>
            {/* List of saved subgraphs, draggable onto the canvas */}
            <ArticlesSection user={user} />
          </div>
        </div>

        <button
          onClick={onBack}
          
          title="Go Back"
        >
          
          <div className="flex items-center justify-center gap-2 self-start rounded-lg   bg-transparent p-1.5 text-gray-900 transition-colors hover:bg-gray-500 hover:text-white cursor-pointer w-fit px-4">
  <FaArrowLeft size={14} /> 
  <span className="text-sm font-medium">Go Back</span>
</div>
          
          
        </button>

        {/* Subtle Footer info */}
        <div className="p-4  border-t border-[#262626]">
          <div className="text-[9px] text-gray-500 text-center uppercase tracking-tighter">
            Drag nodes or articles onto the canvas
          </div>
        </div>
      </aside>
    </div>
  );
}
