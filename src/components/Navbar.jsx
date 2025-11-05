// src/components/Navbar.jsx
"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

const Navbar = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <nav className="flex items-center justify-between px-6 py-1 border-b bg-background/80 backdrop-blur-md">
            <h1 className="text-lg font-semibold tracking-tight">🌳 JSON Tree Visualizer</h1>

            <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
                {theme === "light" ? (
                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                )}
            </Button>
        </nav>
    );
};

export default Navbar;
