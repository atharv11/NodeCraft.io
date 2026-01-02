import React from "react";
import { auth } from "./FireBase.js";
import { signOut } from "firebase/auth";

interface DashboardProps {
  user: any; // "I expect a user object"
  onOpenEditor: () => void; // "I expect a function called onOpenEditor"
}

function Dashboard(props: DashboardProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // App.tsx detects this automatically and redirects to Login
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className=" w-1/5 bg-[#353535] h-screen  rounded-br-4xl rounded-tr-4xl mt-16">
        <button
          className="absolute bottom-2 cursor-pointer p-5  bg-amber-600"
          onClick={handleLogout}
        >
          {" "}
          Logout
        </button>
      </div>

      <div className="w-4/5  h-screen">
        <div className="p-5 mt-3 text-2xl w-15 bg-amber-200">
          welcome {props.user.email}
        </div>
        <div className=" bg-amber-700 grid  gap-4 justify-start items-center h-auto p-2  m-5 ">
          <button
            className="bg-red-300 p-5 w-60 h-35 rounded-4xl cursor-pointer"
            onClick={props.onOpenEditor}
          >
            Go to your project
          </button>
          <button
            className="bg-red-300 p-5 w-60 h-35 rounded-4xl cursor-pointer"
            onClick={props.onOpenEditor}
          ></button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
