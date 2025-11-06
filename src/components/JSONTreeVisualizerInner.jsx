"use client";
import React from "react";
import "@xyflow/react/dist/style.css";
import Flow from "./Trees";

export default function JSONTreeVisualizerInner() {


    return (
        <div className="w-full h-screen flex">
            <Flow />
        </div>
    );
}
