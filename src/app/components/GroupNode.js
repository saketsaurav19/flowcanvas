// components/GroupNode.js
import React, { memo } from "react";
import { NodeResizer } from "@xyflow/react";
import { rgbToRgba } from "../utils/colorUtils";

function GroupNode({ id, data, selected }) {
  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={150}
        minHeight={80}
      />

      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: rgbToRgba(data.color, 0.3) || "rgba(173, 216, 230, 0.3)",
          border: "2px dashed #4287f5",
          borderRadius: "8px",
          padding: "15px",
          boxSizing: "border-box",
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
