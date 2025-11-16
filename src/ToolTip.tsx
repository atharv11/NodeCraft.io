import React, { type ReactElement } from "react";

type ToolTipProperties = {
children: React.ReactElement;
};

export default function ToolTip({ children }: ToolTipProperties) {
  return (
    <div className="Container  group">
    
        {children}
        <div className="Tool-Tip absolute  p-2 z-9999
          bg-gray-800 text-white text-xs rounded shadow-lg 
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          whitespace-nowrap transition-opacity duration-300
          bottom-full left-1/2 -translate-x-1/2 mb-1"> 
          
          See this after you have hovered
            </div>
    </div>
  );
}