import React, { useEffect, useState } from "react";
import { auth, db } from "./FireBase.js";
import { signOut, deleteUser } from "firebase/auth"; // Import deleteUser
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { createNewProject, deleteProjectFromCloud } from "./ReadWriteService.js";
import { FaTrash } from "react-icons/fa";
import { CustomPrompt } from "./CustomPrompt.js";

interface DashboardProps {
  user: any;
  onOpenEditor: (projectId: string, name?: string) => void;
}

function Dashboard({ user, onOpenEditor }: DashboardProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const projectsRef = collection(db, "users", user.uid, "projects");
      const q = query(projectsRef, orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const projectData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectData);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // NEW: Handle Account Deletion
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action is permanent and all your projects will be lost."
    );

    if (confirmed && auth.currentUser) {
      try {
        await deleteUser(auth.currentUser);
        alert("Account deleted successfully.");
      } catch (error: any) {
        if (error.code === "auth/requires-recent-login") {
          alert("For security reasons, please log out and log back in again before deleting your account.");
        } else {
          console.error("Error deleting account:", error);
          alert("Failed to delete account. Please try again.");
        }
      }
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    try {
      await deleteProjectFromCloud(user.uid, projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="flex w-full min-h-dvh bg-[#f7f7f7]">
      {/* Sidebar */}
      <div className="w-1/5 bg-[linear-gradient(to_bottom,#E0F2FE,transparent)] border-r-2 border-white flex flex-col gap-2">
        <div className="p-4 text-gray-800 font-extralight truncate">NodeCraft.io</div>
        <div className="w-full text-left p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer text-lg">Account</div>
        <div className="w-full text-left p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer text-lg">Trash</div>
        <div className="w-full text-left p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer text-lg">Settings</div>
        
        <div className="p-1 border-t border-gray-200 mt-auto">
          <button className="w-full text-left p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer text-sm" onClick={handleLogout}>
            Logout
          </button>
          {/* UPDATED BUTTON */}
          <button 
            className="w-full text-left p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer text-sm font-medium transition-colors" 
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-4/5 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-light text-gray-800 italic">Welcome, {user?.displayName || "User"}</h1>
        </header>

        <div className="flex flex-wrap gap-6 items-start">
          {projects.map((project) => (
            <div key={project.id} className="relative group">
              <button
                onClick={(e) => handleDeleteProject(e, project.id)}
                className="absolute top-3 right-3 z-10 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white cursor-pointer shadow-sm"
              >
                <FaTrash size={12} />
              </button>

              <button
                className="flex flex-col justify-between border-2 border-white cursor-pointer bg-[linear-gradient(to_bottom,#ffffff,transparent)] p-6 w-64 h-44 rounded-2xl shadow-sm hover:shadow-lg transition-all text-left"
                onClick={() => onOpenEditor(project.id, project.name)}
              >
                <h3 className="text-lg font-semibold text-gray-800 truncate pr-6">{project.name || "Untitled Project"}</h3>
                <div className="w-full text-[10px] font-medium p-2 bg-gray-50 rounded-lg text-gray-600 border border-gray-100">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </button>
            </div>
          ))}

          <CustomPrompt 
            onSave={async (projectName: string) => {
              if (!user) return;
              const finalName = projectName.trim() || "Untitled Project";
              const newId = await createNewProject(user.uid, user.email, finalName);
              onOpenEditor(newId, finalName);
            }} 
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;