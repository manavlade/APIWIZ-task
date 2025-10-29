import React from "react";
import './App.css'
import { Toaster } from "react-hot-toast";
import JSONTreeVisualizer from "./components/TreeGenerator";
import { ReactFlowProvider } from "@xyflow/react";

function App() {

  return (
    <div>
      <Toaster />
      <ReactFlowProvider>
        <JSONTreeVisualizer />
      </ReactFlowProvider>
    </div>

  )
}

export default App
