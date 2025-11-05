import React from "react";
import './App.css'
import { Toaster } from "react-hot-toast";
import JSONTreeVisualizer from "./components/TreeGenerator";
import { ReactFlowProvider } from "@xyflow/react";
import { ThemeProvider } from "next-themes";
import Navbar from "./components/Navbar";

function App() {

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Toaster />
        <Navbar />
        <ReactFlowProvider>
          <JSONTreeVisualizer />
        </ReactFlowProvider>
      </ThemeProvider>
    </div>

  )
}

export default App
