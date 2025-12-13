"use client";
import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

// 🟦 Simple text node
export const TextNode = memo(({ data = {}, isConnectable }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
        style={{ width: 50, height: 50 }}
      />
      <div
        style={{
          padding: "10px",
          border: "1px solid #222",
          borderRadius: "5px",
          background: data.color || "#fff",
          color: data.textColor || "#000",
          fontSize: "4rem"
        }}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ width: 50, height: 50 }}
      />
    </>
  );
});

// 🟩 Image node (with connection handles)
export const ImageNode = memo(({ data = {}, isConnectable }) => {
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
        style={{ width: 50, height: 50 }}
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
        style={{ width: 50, height: 50 }}
      />
    </div>
  );
});
