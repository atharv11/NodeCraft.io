import React, { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { RxCross2 } from "react-icons/rx";

export default function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [ShowButton, setShowButton] = useState(false);

  const handleMouseEnter = (evt: React.MouseEvent) => {
    setShowButton(true);
  };
    const handleMouseLeave = (evt: React.MouseEvent) => {
    setShowButton(false);
  };

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd || ""} style={style}  />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 22,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        
        >
        
          <RxCross2
            className="p-1.5  w-[2.5vw] h-[2.5vw] bg-[#0E6EF7] text-white rounded-full cursor-pointer flex items-center justify-center  hover:bg-red-700  shadow"
            onClick={onEdgeClick} >
            ×
          </RxCross2>

        </div>
      </EdgeLabelRenderer>
    </>
  );
}
