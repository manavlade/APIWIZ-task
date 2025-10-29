// JSONTreeVisualizer.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Textarea } from "./ui/textarea"; // keep your textarea component
import toast from "react-hot-toast";
import useDebounce from "@/hooks/useDebounce";
import html2canvas from "html2canvas";

/**
 * Inner component — must be rendered inside ReactFlowProvider
 * so that useReactFlow() works without the zustand error.
 */
function JSONTreeVisualizerInner() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [jsonInput, setJsonInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  // ref to the right-side visualization container (we'll screenshot this)
  const reactFlowWrapper = useRef(null);

  // useReactFlow must be called inside the provider
  const { setCenter, fitView } = useReactFlow();

  // --- Build tree from JSON (returns nodes + edges) ---
  const buildTree = useCallback((data, parentId = null, depth = 0, y = 0) => {
    let nodesAcc = [];
    let edgesAcc = [];

    const nodeId = parentId ? `${parentId}-${depth}-${y}` : "root";

    const getTypeColor = (value) => {
      if (Array.isArray(value)) return "#22c55e";
      if (typeof value === "object" && value !== null) return "#3b82f6";
      return "#f97316";
    };

    const node = {
      id: nodeId,
      data: { label: parentId ? parentId.split("-").pop() : "root", value: data },
      position: { x: depth * 250, y },
      style: {
        background: getTypeColor(data),
        color: "white",
        padding: 10,
        borderRadius: 8,
        border: "2px solid rgba(255,255,255,0.12)",
        fontSize: 14,
        minWidth: 120,
        textAlign: "center",
        fontWeight: 500,
        boxShadow: "0 0 8px rgba(0,0,0,0.2)",
        transition: "all 0.2s ease",
      },
    };

    nodesAcc.push(node);

    if (typeof data === "object" && data !== null) {
      const entries = Array.isArray(data) ? data.map((v, i) => [i, v]) : Object.entries(data);
      let childY = y + 120;

      for (const [key, value] of entries) {
        const { nodes: childNodes, edges: childEdges } = buildTree(
          value,
          `${nodeId}-${key}`,
          depth + 1,
          childY
        );

        edgesAcc.push({
          id: `${nodeId}-${key}-edge`,
          source: nodeId,
          target: `${nodeId}-${key}-${depth + 1}-${childY}`,
          type: "smoothstep",
        });

        nodesAcc = nodesAcc.concat(childNodes);
        edgesAcc = edgesAcc.concat(childEdges);

        // push childY down so siblings don't overlap
        childY += Math.max(childNodes.length, 1) * 80;
      }
    } else {
      // primitive value node
      const valueId = `${nodeId}-value`;
      const valueNode = {
        id: valueId,
        data: { label: String(data) },
        position: { x: (depth + 1) * 250, y },
        style: {
          background: "#fde047",
          color: "#000",
          padding: 10,
          borderRadius: 8,
          border: "2px solid rgba(0,0,0,0.12)",
          fontSize: 14,
          minWidth: 100,
          textAlign: "center",
          fontWeight: 500,
          boxShadow: "0 0 8px rgba(0,0,0,0.08)",
        },
      };
      nodesAcc.push(valueNode);
      edgesAcc.push({
        id: `${nodeId}-value-edge`,
        source: nodeId,
        target: valueId,
        type: "smoothstep",
      });
    }

    return { nodes: nodesAcc, edges: edgesAcc };
  }, []);

  // Visualize button
  const handleVisualize = () => {
    try {
      const json = JSON.parse(jsonInput);
      const { nodes: newNodes, edges: newEdges } = buildTree(json);
      setNodes(newNodes);
      setEdges(newEdges);
      // small delay then fit view
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    } catch (err) {
      toast.error("Invalid JSON");
    }
  };

  // Debounced search effect: highlight and center matched node
  useEffect(() => {
    if (!debouncedSearch || !nodes.length) return;

    const q = debouncedSearch.toLowerCase().trim();
    // match label or value string
    const matches = nodes.filter((n) => {
      const label = (n.data?.label ?? "").toString().toLowerCase();
      const value = (n.data?.value ?? "").toString().toLowerCase();
      return label.includes(q) || value.includes(q);
    });

    if (matches.length === 0) {
      // reset styles if nothing matched
      setNodes((nds) => nds.map((n) => ({ ...n, style: { ...n.style, border: "2px solid rgba(255,255,255,0.12)", boxShadow: n.style?.boxShadow } })));
      return;
    }

    // highlight all matches
    setNodes((nds) =>
      nds.map((n) => {
        const isMatch = matches.some((m) => m.id === n.id);
        return {
          ...n,
          style: {
            ...n.style,
            border: isMatch ? "3px solid #facc15" : "2px solid rgba(255,255,255,0.12)",
            boxShadow: isMatch ? "0 0 20px #facc15" : n.style?.boxShadow,
          },
        };
      })
    );

    // center on first match
    const first = matches[0];
    setCenter(first.position.x, first.position.y, { zoom: 1.4, duration: 600 });
  }, [debouncedSearch, nodes, setCenter]);

  // Download the right-panel area as PNG
  const handleDownloadImage = async () => {
    if (!reactFlowWrapper.current) return;
    try {
      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: "#0b1220",
        useCORS: true,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `json-tree-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      toast.error("Failed to capture image");
      console.error(err);
    }
  };

  return (
    <div className="w-full h-screen flex">
      {/* LEFT PANEL */}
      <div className="w-1/3 p-6 border-r border-gray-700 flex flex-col gap-4 bg-[#0a0a0a]">
        <h2 className="text-white text-xl font-semibold mb-2">JSON Tree Visualizer 🌳</h2>

        <Textarea
          className="flex-1 bg-black text-white border border-gray-700 p-3 rounded-md text-sm"
          placeholder={`{
  "user": {
    "name": "John",
    "age": 25,
    "hobbies": ["music", "sports"]
  }
}`}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={handleVisualize}
            className="bg-[#3b82f6] text-white px-4 py-2 rounded-md hover:opacity-80 transition"
          >
            Visualize
          </button>

          <button
            onClick={handleDownloadImage}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:opacity-80 transition"
          >
            📸 Download Tree
          </button>
        </div>

        <input
          type="text"
          placeholder="🔍 Search key/value..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-black border border-gray-700 text-white rounded-md p-2 text-sm"
        />

        <div className="text-gray-400 text-sm mt-2">
          <p>
            <span className="text-blue-400">Blue</span> = Object
          </p>
          <p>
            <span className="text-green-400">Green</span> = Array
          </p>
          <p>
            <span className="text-orange-400">Orange</span> = Primitive
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - visualization area (we attach ref here for screenshot) */}
      <div className="w-2/3 h-full bg-[#111] p-4 overflow-auto" ref={reactFlowWrapper}>
        <div style={{ width: "100%", height: "100%" }}>
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

/**
 * Export default wrapped inside ReactFlowProvider so hooks work.
 * Use this component in your app directly.
 */
export default function JSONTreeVisualizer() {
  return (
    <ReactFlowProvider>
      <JSONTreeVisualizerInner />
    </ReactFlowProvider>
  );
}
