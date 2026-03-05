/* 
  Article.tsx

  Responsibilities:
  - Read articles (saved subgraphs) from Firestore at: users/{uid}/articles
  - Display them in the sidebar under "Articles"
  - Make each article draggable using useDnD
  - On drop: clone its nodes & edges, remap IDs, and insert into ReactFlow graph
  - Allow deleting an article
*/

import React, { useEffect, useState, useCallback } from "react";
import {
  useReactFlow,
  type Node,
  type Edge,
  type XYPosition,
} from "@xyflow/react";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { nanoid } from "nanoid";
import { FaTrash } from "react-icons/fa";

import { db } from "./FireBase.js";
import { useDnD, type OnDropAction } from "./useDnD.js";

interface Article {
  id: string;
  name: string;
  description?: string;
  nodes?: Node[];
  edges?: Edge[];
  createdAt?: any;
}

interface ArticlesSectionProps {
  user: User;
}

/**
 * ArticlesSection
 * - Shows a list of saved subgraphs ("articles") for the current user.
 * - Each article is draggable.
 * - Dropping an article onto the canvas instantiates its nodes & edges.
 * - Each article can be deleted.
 */
export function ArticlesSection({ user }: ArticlesSectionProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const { onDragStart } = useDnD();
  const { setNodes, setEdges } = useReactFlow();

  // 1) Load articles for the current user
  useEffect(() => {
    const articlesRef = collection(db, "users", user.uid, "articles");
    const q = query(articlesRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Article[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;

          return {
            id: docSnap.id,
            name: data.name ?? "Unnamed Article",
            description: data.description ?? "",
            nodes: (data.nodes ?? []) as Node[],
            edges: (data.edges ?? []) as Edge[],
            createdAt: data.createdAt,
          };
        });

        setArticles(list);
      },
      (error) => {
        console.error("Error loading articles:", error);
      }
    );

    return () => unsub();
  }, [user.uid]);

  // 2) Create a drop action that instantiates an article as a subgraph
  const createAddSubgraph = useCallback(
    (article: Article): OnDropAction =>
      ({ position }: { position: XYPosition }) => {
        const articleNodes = article.nodes ?? [];
        const articleEdges = article.edges ?? [];

        if (articleNodes.length === 0 && articleEdges.length === 0) {
          console.warn("Article has no nodes/edges:", article.id);
          return;
        }

        // Map old node IDs -> new node IDs so edges can be rewired
        const idMap = new Map<string, string>();

        // Shift all nodes by the drop position and assign new IDs
        const newNodes: Node[] = articleNodes.map((node: Node) => {
          const newId = nanoid();
          idMap.set(node.id, newId);

          const nodePos = node.position ?? { x: 0, y: 0 };

          return {
            ...node,
            id: newId,
            position: {
              x: nodePos.x + position.x,
              y: nodePos.y + position.y,
            },
          };
        });

        // Rewire edges with the new node IDs and assign new edge IDs
        const newEdges: Edge[] = articleEdges.map((edge: Edge) => {
          const newId = nanoid();
          const newSource = idMap.get(edge.source as string);
          const newTarget = idMap.get(edge.target as string);

          if (!newSource || !newTarget) {
            console.warn("Edge references missing node in article:", edge);
          }

          return {
            ...edge,
            id: newId,
            source: newSource ?? edge.source,
            target: newTarget ?? edge.target,
          };
        });

        // Append nodes & edges to the current graph
        setNodes((current) => current.concat(newNodes));
        setEdges((current) => current.concat(newEdges));
      },
    [setNodes, setEdges]
  );

  // 3) Delete an article
  const handleDeleteArticle = useCallback(
    async (articleId: string) => {
      const confirmDelete = window.confirm("Delete this article permanently?");
      if (!confirmDelete) return;

      try {
        const articleRef = doc(db, "users", user.uid, "articles", articleId);
        await deleteDoc(articleRef);

        // Optional: optimistic update (onSnapshot will also update)
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
      } catch (err) {
        console.error("Error deleting article:", err);
        alert("Failed to delete article.");
      }
    },
    [user.uid]
  );

  // 4) UI Rendering

  if (!articles.length) {
    return (
      <div className="text-[11px] text-gray-500">
        No articles saved yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {articles.map((article) => (
        <div
          key={article.id}
          className="group flex items-center justify-between cursor-pointer p-2 rounded-lg text-gray-800 border bg-gray-200  hover:bg-gray-500 transition-all duration-200 shadow-sm"
          onPointerDown={(event) => {
            // Only start drag when clicking the main card, not the delete button
            onDragStart(
              event as React.PointerEvent<HTMLDivElement>,
              createAddSubgraph(article)
            );
          }}
        >
          <div className="flex flex-col min-w-0 cursor-grab">
            <span className="text-xs font-medium truncate">
              {article.name}
            </span>
            {article.description && (
              <span className="text-[10px] text-gray-500 truncate">
                {article.description}
              </span>
            )}
          </div>

          {/* Delete button */}
          <button
            className="ml-2 p-1 rounded-md hover:bg-red-600/80 text-red-400 hover:text-white transition-colors cursor-pointer"
            title="Delete article"
            onClick={(e) => {
              e.stopPropagation(); // prevent starting a drag
              e.preventDefault();
              handleDeleteArticle(article.id);
            }}
          >
            <FaTrash size={10} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ArticlesSection;
