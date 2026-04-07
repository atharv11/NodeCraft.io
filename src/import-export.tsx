import React, { useRef } from "react";
import { type Node, type Edge } from "@xyflow/react";
import { motion } from "framer-motion";

interface ImportExportProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
}

export default function ImportExport({
  nodes,
  edges,
  setNodes,
  setEdges,
}: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EXPORT LOGIC ---
  const handleExport = () => {
    const data = { nodes, edges };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "ppr_model.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- IMPORT LOGIC ---
  const handleImportClick = () => {
    fileInputRef.current?.click(); // Trigger the hidden file input
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        // Validate that the JSON has the shape we expect
        if (parsedData.nodes && parsedData.edges) {
          setNodes(parsedData.nodes);
          setEdges(parsedData.edges);
          alert("PPR Model imported successfully!");
        } else {
          alert("Invalid file format. Please upload a valid PPR model JSON.");
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        alert("Failed to read file. Ensure it is a valid JSON document.");
      }
    };
    
    reader.readAsText(file);

    // Reset input so the exact same file can be imported again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50 flex gap-2">
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-lg text-xs sm:text-sm font-bold uppercase tracking-tight cursor-pointer"
        onClick={handleImportClick}
        title="Import a PPR model from a JSON file"
      >
        Import JSON
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        className="px-4 py-2 bg-[#0E6EF7] text-white border border-transparent rounded-xl shadow-lg text-xs sm:text-sm font-bold uppercase tracking-tight cursor-pointer"
        onClick={handleExport}
        title="Export current PPR model to JSON"
      >
        Export JSON
      </motion.button>
    </div>
  );
}
