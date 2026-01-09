
import { GoTasklist } from "react-icons/go";
import { TbLayoutGridAdd } from "react-icons/tb";
import React, { useCallback, useState } from "react";
import {
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import CustomHandle from "./CustomHandle.js";
import { RxCross2 } from "react-icons/rx";

type ProcessData = { ItemName: string; Quantity: number };

export type ProcessNode = Node<ProcessData, "Process">;

const Process = ({ data, id }: NodeProps<ProcessNode>) => {
  const { setNodes } = useReactFlow();
  const [Hovered, setHovered] = useState(false);
  const [AttriHover, setAttriHover] = useState(false);
  const { ItemName, Quantity } = data;
  const AttriData =["Mass/Weight","Length","Width","Height"]
  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);

    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, ItemName: evt.target.value } };
        }
        return n;
      })
    );
  }, []);

  //function to delete a node
  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  }, [id, setNodes]);

  //function that gives list of attributes for attribute icon in a node
  const AttributeHover = () => {
    return (
      <div className="flex items-center justify-center p-1 w-20 h-auto bg-white shadow-2xl"></div>
    );
  };

  return (
    <div className="w-full h-full ">
      <div className="ProductNode w-20px h-10px rounded-3xl bg-[#0E6EF7] text-white shadow-2xl">
        <div className="multiPurposeButton  p-2">
          <button
            className={`
            bg-white text-[#353535] rounded-full h-10 flex 
            transition-all duration-300 shadow-md overflow-hidden
            ${Hovered ? "w-45" : "w-10"} 
          `}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <TbLayoutGridAdd
              className={` ${
                Hovered
                  ? "w-0 opacity-0"
                  : "w-6 h-6 cursor-pointer text-[#353535] bg-[#c7c7c7] rounded-full p-1 m-2"
              }`}
            />
            <div
              className={`flex  ${
                Hovered ? "w-auto opacity-100 mr-2" : "w-0 opacity-0 mr-0"
              }`}
            >
              <RxCross2
                className="DeleteIcon w-6 h-6 cursor-pointer text-[#353535] bg-[#c7c7c7] rounded-full p-1 m-2"
                onClick={handleDelete}
              />
              <GoTasklist
                className="AtrributeIcon w-6.5 h-6.5 cursor-pointer text-[#353535] bg-[#c7c7c7] rounded-full p-1 m-2"
                onClick={()=> setAttriHover(!AttriHover)} onDoubleClick={()=>  setAttriHover(!AttriHover)}
              />
            </div>
          </button>
        </div>
        <div className="bg-[#353535] text-updater-node rounded-3xl p-3">
          <div>
            <input
              id="text"
              name="text"
              placeholder="Name your process"
              onChange={onChange}
              className="nodrag text-[1.5vw]"
              defaultValue={data.ItemName || ""}
            />
          </div>
        </div>
      </div>
    {AttriHover && (
  <div 
    className="absolute top-16 left-0 z-50 p-3 w-48 bg-white shadow-xl rounded-xl border border-gray-100 flex flex-col gap-2"
    onMouseEnter={() => setAttriHover(true)} 
    onMouseLeave={() => setAttriHover(false)}
  >
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
      Weight / Mass
    </label>
    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-200">
      <input
        type="number"
        placeholder="0"
        className="nodrag w-full bg-transparent text-sm outline-none text-gray-700"
        defaultValue={data.Quantity || ""}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          setNodes((nodes) =>
            nodes.map((n) => {
              if (n.id === id) {
                return { ...n, data: { ...n.data, Quantity: val } };
              }
              return n;
            })
          );
        }}
      />
      <span className="text-gray-400 font-medium text-sm border-l pl-2 border-gray-300">
        g
      </span>
    </div>
    
  </div>
)}
      <CustomHandle
        className=""
        type="source"
        position={Position.Top}
        id="source-top"
      />
      <CustomHandle type="source" position={Position.Right} id="source-right" />
      <CustomHandle type="target" position={Position.Bottom} />
    </div>
  );
};

export default Process;
