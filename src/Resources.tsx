//previously this file name was Payment Providers

import React, { useCallback, useState } from "react";
import { Handle, Position, useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { RxCross2 } from "react-icons/rx";
import CustomHandle from "./CustomHandle.js";
import { TbLayoutGridAdd } from "react-icons/tb";
import { GoTasklist } from "react-icons/go";

// 1. Define the specific shape of the data prop
type ResourcesData = { name: string };

// 2. Define the full Node type, specifying the Data and the Type ID ("Resources")
export type ResourcesNode = Node<ResourcesData, "Resources">;

// 3. Update the component signature to use the fully defined NodeProps type
const Resources = ({ data, id }: NodeProps<ResourcesNode>) => {
  // Destructure the 'name' from the data prop
  const { name } = data;
  
  const { setNodes } = useReactFlow();
  const [Hovered, setHovered] = useState(false);
  const [AttriHover, setAttriHover] = useState(false);
  

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
  
        <div className="ResourcesNode w-20px h-10px rounded-3xl bg-[#bfbfbf] text-white shadow-2xl">
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
                          onMouseEnter={()=> setAttriHover(!AttriHover)} onMouseLeave={()=>  setAttriHover(!AttriHover)}
                        />
                      </div>
                    </button>
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