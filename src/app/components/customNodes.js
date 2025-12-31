"use client";
import React, { memo } from "react";
import { createPortal } from "react-dom";
import { Maximize2 } from "lucide-react";
import { Handle, Position, NodeResizer, useStore } from "@xyflow/react";
import { useSettings } from "../context/SettingsContext";


// 🟦 Simple text node
export const TextNode = memo(({ data = {}, isConnectable }) => {
  const { handleSize } = useSettings();

  const handleStyle = {
    width: handleSize,
    height: handleSize,
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
export const ImageNode = memo(({ data = {}, isConnectable, selected }) => {
  const { handleSize } = useSettings();
  const [showFullscreen, setShowFullscreen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleStyle = {
    width: handleSize,
    height: handleSize,
    opacity: data.hideHandle ? 0 : 1,
    pointerEvents: data.hideHandle ? 'none' : 'all',
  };

  const FullscreenOverlay = () => {
    if (!showFullscreen) return null;

    // Portal to document.body to ensure it's on top of everything
    return createPortal(
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowFullscreen(false);
        }}
      >
        <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
          <img
            src={data.src}
            alt={data.label}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              display: 'block',
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}
          />
          {data.label && (
            <div
              style={{
                position: 'absolute',
                bottom: '-40px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                fontSize: '1.2rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                whiteSpace: 'nowrap',
              }}
            >
              {data.label}
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  const zoom = useStore((s) => s.transform[2]);

  return (
    <>
      {showFullscreen && <FullscreenOverlay />}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          padding: "5px",
          border: "1px solid #222",
          borderRadius: "8px",
          background: "#fff",
          textAlign: "center",
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        <NodeResizer
          color="#ff0071"
          isVisible={selected}
          minWidth={100}
          minHeight={100}
          keepAspectRatio={true}
        />

        {/* Input connection */}
        <Handle
          type="target"
          position={Position.Top}
          onConnect={(params) => console.log("handle onConnect", params)}
          isConnectable={isConnectable}
          style={handleStyle}
        />

        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <img
            src={data.src}
            alt={data.label}
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />

          {/* Full Screen Button Overlay */}
          {isHovered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFullscreen(true);
              }}
              style={{
                position: 'absolute',
                right: '3%',
                top: '3%',
                padding: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
                transform: `scale(${1 / zoom})`,
                transformOrigin: 'top right',
              }}
              title="Full Screen"
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
            >
              <Maximize2 size={20} />
            </button>
          )}
        </div>

        {!isHovered && <div>{data.label}</div>}

        {/* Output connection */}
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={handleStyle}
        />
      </div>
    </>
  );
});
