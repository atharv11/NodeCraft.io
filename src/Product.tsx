import React, { useCallback } from "react";
import { Position, type NodeProps, useReactFlow, type Node } from "@xyflow/react";
import { RxCross2 } from "react-icons/rx";
// Ensure extensions match your strict mode settings (.js usually works best for imports)
import CustomHandle from "./CustomHandle.js"; 

// 1. Fix Type: Use lowercase 'string'
type ProductData = { amount?: string };
export type ProductNode = Node<ProductData, "Product">;

export default function Product({ data, id }: NodeProps<ProductNode>) {
  const { setNodes } = useReactFlow();


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

      <div className="ProductNode w-20px h-10px rounded-3xl bg-[#353535] text-white ">
        <div className="multiPurposeButton pl-[15vw] p-2">
        <RxCross2 className="w-[2.5vw] h-[2.5vw] cursor-pointer  bg-[#898989] rounded-full p-1" onClick={handleDelete} />
        </div>
          <div className="bg-[#5B5B5B] text-updater-node rounded-3xl p-3">
        <div>         
       
          <input 
            id="text" 
            name="text" 
             placeholder="Give your node a name"
            onChange={onChange} 
            className="nodrag" 
            defaultValue={data.amount || ""} // prevents warning if amount is undefined
          />
        </div>
      </div>
      </div>

      <CustomHandle type="source" position={Position.Right} />
    </div>
  );
}