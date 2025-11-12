import React from "react";
import { Position, Handle, type Node, type NodeProps } from "@xyflow/react";
import CustomHandle from "./CustomHandle.jsx";

type PaymentInitData = { amount: number };
export type PaymentInitNode = Node<PaymentInitData, "paymentInit">;

export default function PaymentInit({ data }: NodeProps<PaymentInitNode>) {
  return (
    <div className="w-full h-full">
      <div className="w-20px h-10px rounded-3xl bg-amber-800 border-2 border-amber-950 text-white p-5">
        Payment Initialized
      </div>
      <div className="bg-lime-500 rounded-3xl p-1 border-2">${data.amount}</div>
      <CustomHandle type="source" position={Position.Right} />
    </div>
  );
}
