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

// Updated type to include the dynamic keys from attributeConfigs
type ProcessData = {
  units?: Record<string, string>; 
  ItemName: string; 
  Quantity?: number;
  Length?: number;
  Width?: number;
  Height?: number;
};

export type ProcessNode = Node<ProcessData, "Process">;

const Process = ({ data, id }: NodeProps<ProcessNode>) => {
  const { setNodes } = useReactFlow();
  const [Hovered, setHovered] = useState(false);
  const [AttriHover, setAttriHover] = useState(false);

  const attributeConfigs = [
    { label: "Weight / Mass", key: "Quantity", options: ["g", "kg", "lb"] },
    { label: "Length", key: "Length", options: ["cm", "m", "inch"] },
    { label: "Width", key: "Width", options: ["cm", "m", "inch"] },
    { label: "Height", key: "Height", options: ["cm", "m", "inch"] },
  ];

  // Updates the "ItemName" field inside data
  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, ItemName: evt.target.value } };
        }
        return n;
      })
    );
  }, [id, setNodes]);

  // Updates numerical attributes (Quantity, Length, etc.) inside data
  const updateField = useCallback((key: string, value: number) => {
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: { ...n.data, [key]: value },
          };
        }
        return n;
      })
    );
  }, [id, setNodes]);

  // Updates unit selections inside data.units
  const updateUnit = useCallback((key: string, value: string) => {
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              units: { ...(n.data.units || {}), [key]: value },
            },
          };
        }
        return n;
      })
    );
  }, [id, setNodes]);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  }, [id, setNodes]);

  return (
    <div className="w-full h-full">
      <div className="ProcessNode rounded-3xl bg-[#0E6EF7] text-white shadow-2xl">
        <div className="multiPurposeButton p-2">
          <button
            className={`bg-white text-[#353535] rounded-full h-10 flex transition-all duration-300 shadow-md overflow-hidden ${
              Hovered ? "w-40" : "w-10"
            }`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <TbLayoutGridAdd
              className={`${
                Hovered
                  ? "w-0 opacity-0"
                  : "w-6 h-6 cursor-pointer text-[#353535] bg-[#c7c7c7] rounded-full p-1 m-2"
              }`}
            />
            <div className={`flex ${Hovered ? "w-auto opacity-100 mr-2" : "w-0 opacity-0 mr-0"}`}>
              <RxCross2
                className="DeleteIcon w-6 h-6 cursor-pointer text-[#353535] bg-[#c7c7c7] rounded-full p-1 m-2"
                onClick={handleDelete}
              />
              <GoTasklist
                className="AtrributeIcon w-6.5 h-6.5 cursor-pointer text-[#353535] bg-[#c7c7c7] rounded-full p-1 m-2"
                onClick={() => setAttriHover(!AttriHover)}
              />
            </div>
          </button>
        </div>

        <div className="bg-[#353535] rounded-3xl p-3">
          <input
            id="text"
            name="text"
            placeholder="Name your process"
            onChange={onChange}
            className="nodrag text-[1.5vw] bg-transparent outline-none text-white"
            defaultValue={data.ItemName || ""}
          />
        </div>
      </div>

      {AttriHover && (
        <div className="absolute top-10 left-0 z-50 p-4 w-60 border-2 border-white bg-white shadow-2xl rounded-2xl flex flex-col gap-4 text-gray-800">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Attributes</p>
          {attributeConfigs.map((config) => (
            <div key={config.key} className="flex flex-col gap-1">
              <label className="text-[9px] text-gray-500 font-medium">{config.label}</label>
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-400">
                <input
                  type="number"
                  className="nodrag w-full bg-transparent text-sm outline-none"
                  value={data[config.key as keyof ProcessData] as number || ""}
                  onChange={(e) => updateField(config.key, parseFloat(e.target.value) || 0)}
                />
                <select
                  className="nodrag bg-transparent text-[10px] font-bold text-blue-500 outline-none cursor-pointer border-l pl-2 border-gray-300"
                  value={data.units?.[config.key] || config.options[0]}
                  onChange={(e) => updateUnit(config.key, e.target.value)}
                >
                  {config.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <CustomHandle type="source" position={Position.Top} id="source-top" />
      <CustomHandle type="source" position={Position.Right} id="source-right" />
      <CustomHandle type="target" position={Position.Bottom} />
    </div>
  );
};

export default Process;