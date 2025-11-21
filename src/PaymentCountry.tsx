import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import CustomHandle from "./CustomHandle.js";
import ToolTip from "./ToolTip.js";

// 1. Define the specific shape of the data prop
type PaymentCountryData = { ItemName: string, Quantity:number };

// 2. Define the full Node type, specifying the Data and the Type ID ("paymentCountry")
export type PaymentCountryNode = Node<PaymentCountryData, "paymentCountry">;

// 3. Use the correct NodeProps type for the component signature
const PaymentCountry = ({ data}: NodeProps<PaymentCountryNode>) => {
  const { ItemName, Quantity } = data;

  return (
    <div className="text-amber-50 p-2 border-2 border-amber-950 bg-amber-500 rounded-3xl">
      {ItemName} 
      <ToolTip content={Quantity} >
      <CustomHandle type="target" position={Position.Left} />
      </ToolTip>
      <CustomHandle type="source" position={Position.Right} />
    </div>
  );
};

export default PaymentCountry;

