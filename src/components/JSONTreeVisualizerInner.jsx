"use client";
import React, { useState, useRef } from "react";
import { ReactFlow, Controls, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import toast from "react-hot-toast";
import { toPng } from "html-to-image";

import Flow from "./Trees";

export default function JSONTreeVisualizerInner() {
    const reactFlowWrapper = useRef(null);

    const handleDownloadImage = async () => {
        const flow = reactFlowWrapper.current?.querySelector(".react-flow");
        if (!flow) return;

        try {
            const dataUrl = await toPng(flow, {
                backgroundColor: "#0b1220",
                pixelRatio: 3,
                cacheBust: true,
            });
            const link = document.createElement("a");
            link.download = `json-tree-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch {
            toast.error("Failed to download image");
        }
    };


    return (
        <div className="w-full h-screen flex">
         

            <Flow />
        </div>
    );
}
