import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.js"; // Uses your path alias
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";

interface CustomPromptProps {
  onSave: (projectName: string) => void;  //onSave waits for the user to finish typing and hit the "Create" button.
}

export function CustomPrompt({ onSave }: CustomPromptProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onSave(inputValue);
    setOpen(false); // Closes modal after saving
    setInputValue(""); // Clears input for next time
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Your original 'Create New Project' Card Styling */}
        <button
          title="Click to create new project"
          className="flex flex-col justify-center border-3  bg-[linear-gradient(to_bottom,#F3F4F6,transparent)]   shadow-sm hover:shadow-lg  text-left items-center bg-gray-50  border-dashed border-white p-6 w-64 h-44 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
        >
          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-200 group-hover:scale-110  transition-transform">
            <span className="text-3xl text-gray-400 group-hover:text-blue-500">+</span>
          </div>
          <span className="text-sm font-semibold text-gray-500 mt-4 group-hover:text-blue-600">
            Create New Project
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Project Name</DialogTitle>
          <DialogDescription>
            Give your project a name to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            id="projectName"
            placeholder="My Awesome App"
            value={inputValue}
            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setInputValue(e.target.value)}
            onKeyDown={(e: { key: string; }) => e.key === "Enter" && handleConfirm()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleConfirm}
            disabled={!inputValue.trim()}
            className="bg-[#0E6EF7] cursor-pointer"
             // Prevents empty names
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}