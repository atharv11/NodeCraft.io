//previously this file name was Payment Providers

import React, { useCallback } from "react";
import { Handle, Position, useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { RxCross2 } from "react-icons/rx";
import CustomHandle from "./CustomHandle.js";

// 1. Define the specific shape of the data prop
type ResourcesData = { name: string };

// 2. Define the full Node type, specifying the Data and the Type ID ("Resources")
export type ResourcesNode = Node<ResourcesData, "Resources">;

// 3. Update the component signature to use the fully defined NodeProps type
const Resources = ({ data, id }: NodeProps<ResourcesNode>) => {
  // Destructure the 'name' from the data prop
  const { name } = data;
  
  const { setNodes } = useReactFlow();
  

   const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        console.log(evt.target.value);
      //save name of the node as data with the node data
        setNodes((nodes) => nodes.map(n => {
          if (n.id === id) {
            return { ...n, data: { ...n.data,name : evt.target.value } };
          }
          return n;
        }));
       
      }, []);
      
      const handleDelete = useCallback(() => {
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
      }, [id, setNodes]);

return (
  <div className="w-full h-full">
  
        <div className="ResourcesNode w-20px h-10px rounded-3xl bg-[#FFFFFF] text-white shadow-2xl">
          <div className="multiPurposeButton pl-[15vw] p-2">
          <RxCross2 className="w-[2.5vw] h-[2.5vw] cursor-pointer text-[#FFFFFF] bg-[#0E6EF7] rounded-full p-1" onClick={handleDelete} />
          </div>
            <div className="bg-[#353535] text-updater-node rounded-3xl p-3">
          <div>         
         
            <input 
              id="text" 
              name="text" 
               placeholder="Name your Resource"
              onChange={onChange} 
             className="nodrag text-[1.5vw]" 
             defaultValue={data.name || ""}
            />
          </div>
        </div>
        </div>
  
        <CustomHandle type="source" position={Position.Right} />
      <CustomHandle type="target" position={Position.Left} />
      </div>
  );
};

export default Resources;