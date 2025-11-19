"use client";
import React, { useState, useEffect } from "react";
import translations from "../locales/en.json";

const PropertySidebar = ({ node, onClose, onUpdate }) => {
  const [label, setLabel] = useState(node?.data?.label || "");
  const [src, setSrc] = useState(node?.data?.src || "");

  // 🧠 Update local states when the selected node changes
  useEffect(() => {
    setLabel(node?.data?.label || "");
    setSrc(node?.data?.src || "");
  }, [node]);

  if (!node) return null;

  const rgbToHex = (rgb) => {
    if (!rgb || !rgb.startsWith('rgb')) return rgb;
    const match = rgb.match(/(\d+)/g);
    if (!match) return rgb;
    const [r, g, b] = match.map(Number);
    const toHex = (c) => ('0' + c.toString(16)).slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // 🟢 Update label
  const handleLabelChange = (e) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    onUpdate(node.id, { label: newLabel });
  };

  // 🟢 Update image source
  const handleSrcChange = (e) => {
    const newSrc = e.target.value;
    setSrc(newSrc);
    onUpdate(node.id, { src: newSrc });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setSrc(data.url);
        onUpdate(node.id, { src: data.url }); // update node image
      } else {
        alert(translations.upload_failed);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  // 🟢 Update color
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    onUpdate(node.id, { color: newColor });
  };

  // 🟢 Assign random color
  const handleAssignRandomColor = () => {
    const newColor = `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`;
    onUpdate(node.id, { color: newColor });
  };

  // 🟢 Remove color
  const handleRemoveColor = () => {
    onUpdate(node.id, { color: null });
  };

  // 🟢 Toggle text color
  const handleToggleTextColor = () => {
    const newTextColor = node?.data?.textColor === "#000000" ? "#ffffff" : "#000000";
    onUpdate(node.id, { textColor: newTextColor });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "320px",
        height: "100vh",
        background: "#f7f7f7",
        borderLeft: "1px solid #ddd",
        padding: "1rem",
        boxShadow: "-2px 0 5px rgba(0,0,0,0.1)",
        zIndex: 20,
        overflowY: "auto",
      }}
    >
      <button onClick={onClose} style={{ float: "right" }}>✖</button>
      <h3>{translations.node_properties}</h3>

      <p><strong>{translations.id}</strong> {node.id}</p>
      <p><strong>{translations.type}</strong> {node.type}</p>

      {/* ===== Common field: Label ===== */}
      <div style={{ marginTop: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <strong>{translations.label}</strong>
        </label>
        <input
          type="text"
          value={label}
          onChange={handleLabelChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* ===== For imageNode: show image options ===== */}
      {node.type === "imageNode" && (
        <div style={{ marginTop: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            <strong>{translations.image_url}</strong>
          </label>
          <input
            type="text"
            value={src}
            onChange={handleSrcChange}
            placeholder={translations.enter_image_url}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginBottom: "0.5rem",
            }}
          />

          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            <strong>{translations.or_upload_image}</strong>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ width: "100%" }}
          />

          {src && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <img
                src={src}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ===== For textNode, notesNode, and subflow: show color options ===== */}
      {(node.type === "textNode" || node.type === "notesNode" || node.type === "subflow") && (
        <div style={{ marginTop: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            <strong>{translations.background_color}</strong>
          </label>
          <input
            type="color"
            value={rgbToHex(node?.data?.color) || "#ffffff"}
            onChange={handleColorChange}
            style={{
              width: "100%",
              height: "40px",
              border: "none",
              cursor: "pointer",
              background: "transparent",
            }}
          />
          <button
            onClick={handleAssignRandomColor}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            {translations.assign_random_color}
          </button>
          <button
            onClick={handleRemoveColor}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            {translations.remove_color}
          </button>
          <label style={{ display: "block", marginBottom: "0.5rem", marginTop: "1rem" }}>
            <strong>{translations.text_color}</strong>
          </label>
          <button
            onClick={handleToggleTextColor}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              background: node?.data?.textColor === "#000000" ? "#ffffff" : "#000000",
              color: node?.data?.textColor === "#000000" ? "#000000" : "#ffffff",
              fontWeight: "bold",
            }}
          >
            {node?.data?.textColor === "#000000" ? translations.switch_to_white_text : translations.switch_to_black_text}
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertySidebar;