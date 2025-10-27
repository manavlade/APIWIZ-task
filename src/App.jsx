import React from "react";
import Home from "./components/Home";
import './App.css'
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";

function App() {

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div>
          <Home />
          <ModeToggle/>
        </div>
      </ThemeProvider>
    </>
  )
}

export default App
