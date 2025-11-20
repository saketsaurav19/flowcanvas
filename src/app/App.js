"use client";
import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import FlowCanvas from "./components/FlowCanvas";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Node 1" },
    position: { x: 0, y: 50 },
  },
];

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas initialNodes={initialNodes} />
    </ReactFlowProvider>
  );
}
