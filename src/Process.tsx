//name of this file was PaymentCountry before

import React, { useCallback } from "react";
import { Handle, Position, useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import CustomHandle from "./CustomHandle.js";
import { RxCross2 } from "react-icons/rx";
import ToolTip from "./ToolTip.js";

// 1. Define the specific shape of the data prop
type ProcessData = { ItemName: string, Quantity:number };

// 2. Define the full Node type, specifying the Data and the Type ID ("Process")
export type ProcessNode = Node<ProcessData, "Process">;

// 3. Use the correct NodeProps type for the component signature
const Process = ({ data , id}: NodeProps<ProcessNode>) => {
    const { setNodes } = useReactFlow();
    
  const { ItemName, Quantity } = data;
   const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
      console.log(evt.target.value);
    //save "name" of the node as data with the node data
      setNodes((nodes) => nodes.map(n => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, ItemName: evt.target.value } };
        }
        return (
          n
          );
      }));
     
    }, []);
    
    const handleDelete = useCallback(() => {
      setNodes((nodes) => nodes.filter((node) => node.id !== id));
    }, [id, setNodes]);
    
    

  return (
  <div className="w-full h-full ">
  
        <div className="ProductNode w-20px h-10px rounded-3xl bg-[#0E6EF7] text-white shadow-2xl">
          <div className="multiPurposeButton pl-[15vw] p-2">
          <RxCross2 className="w-[2.5vw] h-[2.5vw] cursor-pointer text-[#353535] bg-[#ffffff] rounded-full p-1" onClick={handleDelete} />
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
  
       <CustomHandle type="source" position={Position.Top} id="source-top" />
       <CustomHandle type="source" position={Position.Right} id="source-right" />
      <CustomHandle type="target" position={Position.Bottom} />
      </div>
  );
};

export default Process;

