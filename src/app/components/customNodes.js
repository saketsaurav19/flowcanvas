"use client";
import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

// 🟦 Simple text node
export const TextNode = memo(({ data = {}, isConnectable }) => {
  const handleStyle = {
    width: 50,
    height: 50,
    opacity: data.hideHandle ? 0 : 1,
    pointerEvents: data.hideHandle ? 'none' : 'all',
  };

  return (
    <div style={{ position: "relative", height: "auto", width: "100%" }}>
      <Handle
        type="target"
        position={Position.Top}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
        style={handleStyle}
      />
      <div
        style={{
          padding: "10px",
          border: "1px solid #222",
          borderRadius: "5px",
          background: data.color || "#fff",
          color: data.textColor || "#000",
          fontSize: "2rem",
          width: "auto",
          minWidth: "100px",
          maxWidth: "600px",
          height: "auto",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap"
        }}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={handleStyle}
      />
    </div>
  );
});

// 🟩 Image node (with connection handles)
export const ImageNode = memo(({ data = {}, isConnectable }) => {
  const handleStyle = {
    width: 50,
    height: 50,
    opacity: data.hideHandle ? 0 : 1,
    pointerEvents: data.hideHandle ? 'none' : 'all',
  };

  return (
    <div
      style={{
        padding: "5px",
        border: "1px solid #222",
        borderRadius: "8px",
        background: "#fff",
        textAlign: "center",
      }}
    >
      {/* Input connection */}
      <Handle
        type="target"
        position={Position.Top}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
        style={handleStyle}
      />

      <img
        src={data.src}
        alt={data.label}
        style={{ width: "100px", height: "100px", objectFit: "cover" }}
      />
      <div>{data.label}</div>

      {/* Output connection */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={handleStyle}
      />
    </div>
  );
});
