// name of this file was PaymentInit before
import { TbLayoutGridAdd } from "react-icons/tb";
import React, { useCallback, useState } from "react";
import { Position, type NodeProps, useReactFlow, type Node } from "@xyflow/react";
import { RxCross2 } from "react-icons/rx";
// Ensure extensions match your strict mode settings (.js usually works best for imports)
import CustomHandle from "./CustomHandle.js"; 
import { GoTasklist } from "react-icons/go";

// 1. Fix Type: Use lowercase 'string'
type ProductData = { amount?: string };
export type ProductNode = Node<ProductData, "Product">;

export default function Product({ data, id }: NodeProps<ProductNode>) {
  const { setNodes } = useReactFlow();
   const [Hovered, setHovered] = useState(false);
    const [AttriHover, setAttriHover] = useState(false);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  }, [id, setNodes]);

  // 3. Fix Scope & Type: Define onChange separately at the top level
  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
  //save name of the node as data with the node data
    setNodes((nodes) => nodes.map(n => {
      if (n.id === id) {
        return { ...n, data: { ...n.data, amount: evt.target.value } };
      }
      return n;
    }));
   
  }, []);

  return (
    <div className="w-full h-full">

      <div className="ProductNode w-20px h-10px rounded-3xl bg-[#353535] text-white shadow-2xl">
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
          <div className="bg-[#5B5B5B] text-updater-node rounded-3xl p-3">
        <div>         
       
          <input 
            id="text" 
            name="text" 
             placeholder="Give your node a name"
            onChange={onChange} 
            className="nodrag text-[1.5vw]" 
            defaultValue={data.amount || ""} // prevents warning if amount is undefined
          />
        </div>
      </div>
      </div>

      <CustomHandle type="source" position={Position.Top} />
      <CustomHandle type="target" position={Position.Bottom} />
    </div>
  );
}