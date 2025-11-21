import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useReactFlow } from "@xyflow/react";

// Define the payment provider data structure
type Provider = { name: string };

// Define the constants outside the component function
const PAYMENT_PROVIDERS: Provider[] = [
  { name: "PCB" },
  { name: "CHIP" },
  { name: "Heat Spreader" },
  { name: "Capacitor" },
];

// Define common styles for better readability and reuse
const buttonStyles = {
  backgroundColor: "#f59e0b",
  borderRadius: "2rem",
  border: "2px solid black",
  color: "black",
  "&:hover": {
    backgroundColor: "#d97706",
  },
};

export default function PaymentProviderSelect() {
  const { setNodes } = useReactFlow();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Function to handle adding the node
  const onProviderClick = (provider: Provider) => {
    setNodes((prevNodes) => [
      ...prevNodes, // Spread operator to include all existing nodes
      {
        // For simplicity, we'll keep your current method but cast prevNodes.length to string.
        id: `provider-${prevNodes.length + 1}`,
        // Position the new node semi-randomly in the flow area
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: { name: provider.name },
        // IMPORTANT: Ensure this 'type' matches the key you use to register
        // the custom component (e.g., 'paymentProviders') in your main ReactFlow setup.
        type: "paymentProviders", 
      },
    ]);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget); // Opens menu
  };

  const handleClose = () => {
    setAnchorEl(null); // Closes menu
  };

  return (
    <>
      <Button
        sx={buttonStyles} // Use the predefined styles
        onClick={handleClick}
        aria-controls={open ? "provider-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
       Add laptop Component
      </Button>

      <Menu
        id="provider-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {PAYMENT_PROVIDERS.map((provider) => (
          <MenuItem
            key={provider.name} // Always include a unique key when mapping lists
            onClick={() => {
              // Perform both actions: close the menu and add the node
              handleClose();
              onProviderClick(provider);
            }}
            sx={buttonStyles} // Use the predefined styles for consistency
          >
            {provider.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}