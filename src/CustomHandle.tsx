import React, { type FC } from "react";
import { Handle, type HandleProps } from "@xyflow/react";
const CustomHandle: FC<HandleProps> = ({ style, ...props }) => {
  return (
    <Handle
      {...props}
      style={{
        width: "1.25rem",
        height: "1.25rem",
        background: "#0E6EF7",
        cursor: "pointer",
      borderWidth: " .15rem",
          
      

      }}
    />
  );
};

export default CustomHandle;