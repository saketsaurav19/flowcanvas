// components/GroupNode.js
import React, { memo, useState, useEffect } from "react";
import { NodeResizer } from "@xyflow/react";

function GroupNode({ data, selected }) {
  const [size, setSize] = useState({
    width: data.width || 250,
    height: data.height || 150,
  });

  // When resized via NodeResizer, it triggers internal dimension change
  useEffect(() => {
    if (data.width && data.height) {
      setSize({ width: data.width, height: data.height });
    }
  }, [data.width, data.height]);

  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={150}
        minHeight={80}
        onResize={(evt, params) => {
          setSize({ width: params.width, height: params.height });
        }}
      />

      <div
        style={{
          width: size.width,
          height: size.height,
          backgroundColor: "rgba(173, 216, 230, 0.3)",
          border: "2px dashed #4287f5",
          borderRadius: "8px",
          padding: "15px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          position: "relative",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "1.1em",
            marginBottom: "10px",
            color: "#212121",
          }}
        >
          {data.label}
        </div>
      </div>
    </>
  );
}

export default memo(GroupNode);
