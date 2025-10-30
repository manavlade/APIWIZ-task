import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Textarea } from "./ui/textarea";
import toast from "react-hot-toast";
import useDebounce from "@/hooks/useDebounce";
import { toPng } from 'html-to-image';
import { Button } from "./ui/button";
import GeminiPromptBox from "./AI-TreeGenerator";


function JSONTreeVisualizerInner() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [jsonInput, setJsonInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const reactFlowWrapper = useRef(null);

  const { setCenter, fitView } = useReactFlow();

  const buildTree = useCallback((data, parentId = null, depth = 0, y = 0, path = "$") => {
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
      data: {
        label: parentId ? parentId.split("-").pop() : "root",
        value: data,
        path
      },
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
        const newPath = Array.isArray(data)
          ? `${path}[${key}]`
          : `${path}.${key}`;

        const { nodes: childNodes, edges: childEdges } = buildTree(
          value,
          `${nodeId}-${key}`,
          depth + 1,
          childY,
          newPath
        );

        edgesAcc.push({
          id: `${nodeId}-${key}-edge`,
          source: nodeId,
          target: `${nodeId}-${key}-${depth + 1}-${childY}`,
          type: "smoothstep",
        });

        nodesAcc = nodesAcc.concat(childNodes);
        edgesAcc = edgesAcc.concat(childEdges);

        childY += Math.max(childNodes.length, 1) * 80;
      }
    } else {
      const valueId = `${nodeId}-value`;
      const valueNode = {
        id: valueId,
        data: { label: String(data), path: `${path}` },
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

  const handleVisualize = () => {
    try {
      const json = JSON.parse(jsonInput);
      const { nodes: newNodes, edges: newEdges } = buildTree(json);
      setNodes(newNodes);
      setEdges(newEdges);

      setTimeout(() => fitView({ padding: 0.2 }), 100);
      toast.success("JSON Visualized");
    } catch (err) {
      toast.error("Invalid JSON");
    }
  };

  useEffect(() => {
    if (!nodes.length) return;

    if (!debouncedSearch.trim()) {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          style: {
            ...n.style,
            border: "2px solid rgba(255,255,255,0.12)",
            boxShadow: n.style?.boxShadow,
          },
        }))
      );
      fitView({ padding: 0.2 });
      return;
    }

    const q = debouncedSearch.toLowerCase().trim();
    const matches = nodes.filter((n) => {
      const label = (n.data?.label ?? "").toString().toLowerCase();
      const value = (n.data?.value ?? "").toString().toLowerCase();
      return label.includes(q) || value.includes(q);
    });

    if (matches.length === 0) {
      toast.dismiss("no-match");
      toast.error("No matches found", { id: "no-match", duration: 1500 });

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          style: {
            ...n.style,
            border: "2px solid rgba(255,255,255,0.12)",
            boxShadow: n.style?.boxShadow,
          },
        }))
      );

      fitView({ padding: 0.2 });
      return;
    }


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

    const first = matches[0];
    setCenter(first.position.x, first.position.y, { zoom: 1.4, duration: 600 });
  }, [debouncedSearch, nodes, setCenter]);


  const handleDownloadImage = async () => {
    const reactFlowElement = reactFlowWrapper.current?.querySelector('.react-flow');

    if (!reactFlowElement) return;

    try {
      const dataUrl = await toPng(reactFlowElement, {
        backgroundColor: '#0b1220',
        pixelRatio: 3,
        cacheBust: true,
        width: reactFlowElement.scrollWidth,
        height: reactFlowElement.scrollHeight,
      });

      const link = document.createElement('a');
      link.download = `json-tree-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error capturing flow:', err);
      toast.error('Failed to download full tree');
    }
  };


  const handleNodeClick = (_, node) => {
    if (node?.data?.path) {
      navigator.clipboard.writeText(node.data.path);
      toast.success(`Copied path: ${node.data.path}`);
    }
  };


  return (
    <div className="w-full h-screen flex">
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

        <div className="flex gap-5">
          <Button
            onClick={handleVisualize}
            className="bg-[#3b82f6] text-white px-4 py-2 rounded-md hover:opacity-80 transition"
          >
            Visualize
          </Button>
          <Button onClick={() => setJsonInput("")}> Clear Text </Button>

          <GeminiPromptBox onJsonGenerated={setJsonInput} />
        </div>

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


      <div className="w-2/3 h-full bg-[#111] p-4 overflow-auto" ref={reactFlowWrapper}>

        <div style={{ width: "100%", height: "100%" }}>
          <div className="flex justify-between" >
            <input
              placeholder="🔍 Search key/value..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black border w-1/2  border-gray-700 text-white rounded-md p-2 text-sm"
            />
            <Button
              onClick={handleDownloadImage}
              className="bg-emerald-600 flex items-end justify-end text-white px-4 py-2 rounded-md hover:opacity-80 transition"
            >
              📸 Download Tree
            </Button>
          </div>

          <ReactFlow nodes={nodes} edges={edges} onNodeClick={handleNodeClick}>
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}


export default function JSONTreeVisualizer() {
  return (
    <ReactFlowProvider>
      <JSONTreeVisualizerInner />
    </ReactFlowProvider>
  );
}
