"use client";
import React, { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import styles from "../CSS/NotesNode.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSettings } from "../context/SettingsContext";


export const NotesNode = memo(({ data = {}, isConnectable }) => {
  const { handleSize } = useSettings();

  const handleStyle = {
    width: handleSize,
    height: handleSize,
    opacity: data.hideHandle ? 0 : 1,
    pointerEvents: data.hideHandle ? 'none' : 'all',
  };

  return (
    <div className={styles.notesNode} style={{ backgroundColor: data.color }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={handleStyle}
      />
      <div style={{ color: data.textColor || "#000000", padding: "1rem", }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {data.label}
        </ReactMarkdown>
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