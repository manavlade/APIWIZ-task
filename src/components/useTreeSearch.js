import { useEffect } from "react";
import toast from "react-hot-toast";

export const useTreeSearch = ({ debouncedSearch, nodes, setNodes, setCenter, fitView }) => {
  useEffect(() => {
    if (!nodes.length) return;

    const defaultBorder = "2px solid rgba(255,255,255,0.12)";

    if (!debouncedSearch.trim()) {
      // Reset to default styles
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          style: { ...n.style, border: defaultBorder, boxShadow: "none" },
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
      toast.error("No matches found", { duration: 1500 });
      return;
    }

    const matchIds = new Set(matches.map((m) => m.id));

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: {
          ...n.style,
          border: matchIds.has(n.id) ? "3px solid #facc15" : defaultBorder,
          boxShadow: matchIds.has(n.id) ? "0 0 20px #facc15" : "none",
        },
      }))
    );

    const first = matches[0];
    setCenter(first.position.x, first.position.y, { zoom: 1.4, duration: 600 });
  }, [debouncedSearch, nodes, setNodes, setCenter, fitView]);
};
