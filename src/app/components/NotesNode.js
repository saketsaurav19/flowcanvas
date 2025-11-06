"use client";
import React, { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import styles from "../CSS/NotesNode.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export const NotesNode = memo(({ data, isConnectable }) => {
  return (
    <div className={styles.notesNode} style={{ backgroundColor: data.color }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div style={{ color: data.textColor || "#000000" , padding: "1rem", }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {data.label}
        </ReactMarkdown>
        </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
});