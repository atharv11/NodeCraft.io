import { useReactFlow, type XYPosition } from "@xyflow/react";
import { useCallback, useState } from "react";
// NOTE: Assuming this file exists and contains OnDropAction, useDnD, useDnDPosition
import { type OnDropAction, useDnD, useDnDPosition } from "./useDnD.js";
import Button from "@mui/material/Button";
import { signOut } from "firebase/auth";
import { auth } from "./FireBase.js";
import { FaArrowLeft } from "react-icons/fa";
import Dashboard from "./Dashboard.js";
import { nanoid } from 'nanoid';

// This is a simple ID generator for the nodes.
let id = 0;



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
 
}

export function Sidebar({onBack }: SidebarProps) {
  const { onDragStart, isDragging } = useDnD();
  // The type of the node that is being dragged.
  const [type, setType] = useState<string | null>(null);

  const { setNodes , setEdges } = useReactFlow();

  const createAddNewNode = useCallback(
    (nodeType: string ): OnDropAction => {
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
    ( edgeTypes:string): OnDropAction => {
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

    <aside className="flex flex-col bg-[linear-gradient(to_bottom,#E0F2FE,transparent)] border-white border-3 h-full rounded-2xl shadow-2xl   overflow-hidden">
      
      {/* Blue Header Section */}
      <div className="relative p-4 h-[6vw] min-h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Your custom spinning/rotated icon */}
          <span className="text-black  text-sm tracking-wide"></span>
        </div>
        
        {/* Back Button - Redesigned to be subtle */}
       
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <p className="text-[#7e7e7e] text-[10px] uppercase  tracking-widest mb-1">
          Components
        </p>

        {/* Draggable Node 1: Product */}
        <div
          className="group flex items-center justify-between  p-3 rounded-xl text-gray-200 cursor-grab  hover:bg-[#d3d3d3] transition-all duration-200 "
          onPointerDown={(event) => {
            setType("Product");
            onDragStart(
              event as React.PointerEvent<HTMLDivElement>,
              createAddNewNode("product")
            );
          }}
        >
          <span className="text-sm font-medium text-black">Product</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#0E6EF7] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Draggable Node 2: Process */}
        <div
          className="group flex items-center justify-between  p-3 rounded-xl text-black cursor-grab    hover:bg-[#d3d3d3] transition-all duration-200 "
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
          className="group flex items-center justify-between  p-3 rounded-xl text-black cursor-grab   hover:bg-[#d3d3d3] transition-all duration-200 "
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
      </div>
       <button 
          onClick={onBack}
          className="flex justify-start items-start gap-1 text-sm bg-white/7 hover:bg-white/20 text-gray-500 p-2 rounded-lg transition-colors cursor-pointer"
          title="Go Back"
        >
          
            <div>
            <FaArrowLeft className="" size={10} /> 
            </div>
            <div className="text-sm">Go Back</div>
          
          
        </button>

      {/* Subtle Footer info */}
      <div className="p-4 border-t ">
        <div className="text-[9px] text-gray-500 text-center uppercase tracking-tighter">
          Drag nodes onto the canvas
        </div>
      </div>
    </aside>
  </div>
);
}