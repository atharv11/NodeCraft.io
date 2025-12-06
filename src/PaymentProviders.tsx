import React from "react";
import { Handle, Position, useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { RxCross2 } from "react-icons/rx";
import CustomHandle from "./CustomHandle.js";

// 1. Define the specific shape of the data prop
type PaymentProviderData = { name: string };

// 2. Define the full Node type, specifying the Data and the Type ID ("paymentProvider")
export type PaymentProviderNode = Node<PaymentProviderData, "paymentProvider">;

// 3. Update the component signature to use the fully defined NodeProps type
const PaymentProviders = ({ data, id }: NodeProps<PaymentProviderNode>) => {
  // Destructure the 'name' from the data prop
  const { name } = data;
  
  const { setNodes } = useReactFlow();
  
  const handleDelete = () => {
    // Correctly update the nodes by filtering out the current node 'id'
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <div className="justify-center items-center flex gap-3 bg-amber-300 text-amber-700  p-1 px-2 rounded-3xl">
      <div>{name}</div>
      <RxCross2 className="cursor-pointer" onClick={handleDelete} />

      <CustomHandle type="target" position={Position.Left} />
      <CustomHandle type="source" position={Position.Right} />
    </div>
  );
};

export default PaymentProviders;