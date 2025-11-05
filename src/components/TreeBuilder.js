export const buildTree = (data, parentId = null, depth = 0, y = 0, path = "$") => {
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
    data: { label: parentId ? parentId.split("-").pop() : "root", value: data, path },
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
    },
  };
  nodesAcc.push(node);

  if (typeof data === "object" && data !== null) {
    const entries = Array.isArray(data)
      ? data.map((v, i) => [i, v])
      : Object.entries(data);
    let childY = y + 120;

    for (const [key, value] of entries) {
      const newPath = Array.isArray(data) ? `${path}[${key}]` : `${path}.${key}`;
      const { nodes, edges } = buildTree(value, `${nodeId}-${key}`, depth + 1, childY, newPath);
      edgesAcc.push({
        id: `${nodeId}-${key}-edge`,
        source: nodeId,
        target: `${nodeId}-${key}-${depth + 1}-${childY}`,
        type: "smoothstep",
      });
      nodesAcc = nodesAcc.concat(nodes);
      edgesAcc = edgesAcc.concat(edges);
      childY += Math.max(nodes.length, 1) * 80;
    }
  } else {
    const valueId = `${nodeId}-value`;
    const valueNode = {
      id: valueId,
      data: { label: String(data), path },
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
};
