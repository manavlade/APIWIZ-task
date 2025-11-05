import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import JSONTreeVisualizerInner from "./JSONTreeVisualizerInner";

export default function JSONTreeVisualizer() {
  return (
    <ReactFlowProvider>
      <JSONTreeVisualizerInner />
    </ReactFlowProvider>
  );
}
