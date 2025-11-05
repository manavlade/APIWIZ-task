// src/Flow.jsx
import React, { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { buildTree } from "./TreeBuilder";
import { Button } from "./ui/button";
import { toast } from "react-hot-toast";
import GeminiPromptBox from "./AI-TreeGenerator";
import { NodeSearch } from "./node-search";

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const flowRef = useRef(null);

  const [userInput, setUserInput] = useState(`{
  "user": {
    "id": 101,
    "name": "Alice",
    "skills": ["React", "Node.js", "GraphQL"]
  }
}`);

  const onConnect = useCallback(
    (params) => setEdges((els) => addEdge(params, els)),
    []
  );

  const generateTreeFromJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      const { nodes: builtNodes, edges: builtEdges } = buildTree(data);
      const nodesWithDefaults = builtNodes.map((n) => ({
        ...n,
        ...nodeDefaults,
      }));
      setNodes(nodesWithDefaults);
      setEdges(builtEdges);
      toast.success("🌳 Tree generated successfully!");
    } catch (err) {
      toast.error("⚠️ Invalid JSON input. Please fix and try again.");
    }
  };

  const handleGenerate = () => generateTreeFromJSON(userInput);

  const handleAIGeneratedJSON = (jsonString) => {
    setUserInput(jsonString);
    generateTreeFromJSON(jsonString);
  };

  const handleNodeClick = (_, node) => {
    if (node?.data?.path) {
      navigator.clipboard.writeText(node.data.path);
      toast.success(`Copied path: ${node.data.path}`);
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-3.5rem)] bg-gradient-to-br from-background to-muted">
      {/* Sidebar */}
      <aside className="w-[26%] min-w-[300px] border-r bg-card/80 backdrop-blur-xl p-6 flex flex-col gap-5 shadow-xl">
        <div>
          <h2 className="font-semibold text-xl text-foreground mb-3 flex items-center gap-2">
            🧩 JSON Input
          </h2>

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full h-64 p-3 bg-muted/50 text-foreground border border-border rounded-xl font-mono text-sm resize-none focus:ring-2 focus:ring-primary focus:outline-none"
          />

          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleGenerate}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:opacity-90"
            >
              Generate Tree 🌿
            </Button>
            <Button
              onClick={() => setUserInput("")}
              variant="outline"
              className="flex-1 text-foreground border-border hover:bg-muted/60"
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <GeminiPromptBox onJsonGenerated={handleAIGeneratedJSON} />
        </div>
      </aside>

      <main className="flex-1 relative" ref={flowRef}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          fitView
        >
          <Panel
            position="top-left"
            className="flex gap-1 rounded-md bg-primary-foreground/80 backdrop-blur p-1 text-foreground border border-border shadow-md"
          >
            <NodeSearch />
          </Panel>

          <Background className="opacity-70" />
          <Controls
            className="dark:!bg-gray-800 dark:!text-white dark:!border-gray-600"
            style={{
              background: "rgba(255,255,255,0.9)",
              borderRadius: 10,
              boxShadow: "0 0 10px rgba(0,0,0,0.15)",
            }}
          />
          <MiniMap
            nodeStrokeColor={(n) =>
              n.style?.background ? n.style.background : "#999"
            }
            nodeColor={(n) =>
              n.style?.background ? n.style.background : "#fff"
            }
            className="dark:invert"
          />
        </ReactFlow>
      </main>
    </div>
  );
};

export default Flow;
