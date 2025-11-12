import React, { type FC } from "react";
// Import the specific type for Handle props from the library
import { Handle, type HandleProps } from "@xyflow/react";

// The component receives all standard HandleProps, 
// so we type the component directly with FC<HandleProps>.
// We also use destructuring for props for cleaner syntax.
const CustomHandle: FC<HandleProps> = ({ style, ...props }) => {
  return (
    <Handle
      {...props}
      style={{
        width: 10,
        height: 10,
        background: "white",
        border: "2px solid black",
        borderRadius: "50%",
        cursor: "pointer",
        // We spread the original 'style' prop *first* to allow the user
        // to override any of these default styles if needed.
        ...style,
      }}
    />
  );
};

export default CustomHandle;