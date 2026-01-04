import React from "react";
import { auth, db } from "./FireBase.js";
import { signOut } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";

interface DashboardProps {
  user: any;
  onOpenEditor: () => void;
}

function Dashboard(props: DashboardProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Create Project Logic
  const handleNewProject = async () => {
    if (!props.user) return;

    try {
      const docRef = await addDoc(collection(db, "users", props.user.uid, "projects"), {
        name: "New Untitled Project",
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log("New project created with ID: ", docRef.id);
      alert("New Project Created!");
      props.onOpenEditor(); 
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project");
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#efefef]">
      {/* Sidebar */}
      <div className="w-1/5 bg-[#fbf9f9] border-r border-gray-300 shadow-sm flex flex-col justify-between">
        <div>
          <div className="bg-blue-300 p-4  text-gray-800 font-extralight">
            {props.user.email}
          </div>
          <nav className="p-4">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Menu
            </div>
            <ul className="mt-4 space-y-2">
              <li className="bg-blue-100 text-blue-900 px-3 py-2 rounded-lg cursor-pointer font-medium">
                XXFutureFeaturesXX
              </li>
            </ul>
          </nav>
        </div>

        <div className="p-1 border-t border-gray-200">
          <button
            className="w-full text-left p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-4/5 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-light text-gray-800 italic">
            welcome, {props.user.email}
          </h1>
        </header>

        {/* Project Grid Layout */}
        <div className="flex flex-wrap gap-6 items-start">
          
          {/* Existing Project Card */}
          <button
            className="group flex flex-col justify-between bg-white border border-gray-200 p-6 w-64 h-44 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer text-left"
            onClick={props.onOpenEditor}
          >
            <div>
            
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                Your Project Name
              </h3>
            </div>
            <div className="w-full text-[10px] font-medium p-2 bg-blue-50 rounded-lg text-blue-700 border border-blue-100">
              Updated XX days ago
            </div>
          </button>

          {/* Create New Project Card */}
          <button
            className="flex flex-col justify-center items-center bg-gray-50 border-2 border-dashed border-gray-300 p-6 w-64 h-44 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
            onClick={handleNewProject}
          >
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-200 group-hover:border-blue-300 transition-all">
              <span className="text-3xl text-gray-400 group-hover:text-blue-500 transition-colors">+</span>
            </div>
            <span className="text-sm font-semibold text-gray-500 group-hover:text-blue-600 mt-4">
              Create New project
            </span>
          </button>
          
        </div>
      </div>
    </div>
  );
}

export default Dashboard;