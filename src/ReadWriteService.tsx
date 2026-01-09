import { db } from "./FireBase.js";
import { doc, getDoc, setDoc, collection, addDoc, deleteDoc } from "firebase/firestore";

// Function to Create a New Project
export const createNewProject = async (userId: string, userEmail: any , ProjectName: String) => {
  const docRef = await addDoc(collection(db, "users", userId, "projects"), {
    name: ProjectName,
    nodes: [],
    edges: [],
    email: userEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

// Function to Save Project Data (Universal)
export const saveProjectData = async (userId: string, projectId: string, data: any) => {
  // If projectId exists, save to sub-collection. If not, save to main user doc.
  const docRef = projectId 
    ? doc(db, "users", userId, "projects", projectId)
    : doc(db, "users", userId);

  await setDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};
//delete from firestore 
export const deleteProjectFromCloud = async (userId: string, projectId: string) => {
  const docRef = doc(db, "users", userId, "projects", projectId);
  await deleteDoc(docRef);
};