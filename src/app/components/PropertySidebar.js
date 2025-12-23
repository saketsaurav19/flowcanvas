"use client";
import React, { useState, useEffect } from "react";
import translations from "../locales/en.json";
import { rgbToHex } from "../utils/colorUtils";
import { generateRandomColor } from "../utils/colorUtils";
import styles from "./PropertySidebar.module.css";

const PropertySidebar = ({ node, edge, onClose, onUpdate, onUpdateEdge, onDelete, onDeleteEdge }) => {
  const [label, setLabel] = useState("");
  const [src, setSrc] = useState("");
  const [parentId, setParentId] = useState("");

  // Edge specific states
  const [edgeLabel, setEdgeLabel] = useState("");
  const [edgeType, setEdgeType] = useState("default");
  const [edgeColor, setEdgeColor] = useState("#b1b1b7");
  const [edgeWidth, setEdgeWidth] = useState(1);
  const [edgeMarker, setEdgeMarker] = useState(false);
  const [edgeAnimated, setEdgeAnimated] = useState(false);
  const [edgeLabelFontSize, setEdgeLabelFontSize] = useState(12);
  const [edgeLabelBgColor, setEdgeLabelBgColor] = useState("#ffffff");
  const [edgeLabelBgBorderRadius, setEdgeLabelBgBorderRadius] = useState(2);

  // Update local states when the selected node changes
  useEffect(() => {
    if (node) {
      setLabel(node?.data?.label || "");
      setSrc(node?.data?.src || "");
      setParentId(node?.parentId || "");
    }
  }, [node]);

  // Update local states when the selected edge changes
  useEffect(() => {
    if (edge) {
      setEdgeLabel(edge.label || "");
      setEdgeType(edge.type || "default");
      setEdgeColor(edge.style?.stroke || "#b1b1b7");
      setEdgeWidth(parseInt(edge.style?.strokeWidth) || 1);
      setEdgeMarker(!!edge.markerEnd);
      setEdgeAnimated(!!edge.animated);
      setEdgeLabelFontSize(parseInt(edge.labelStyle?.fontSize) || 12);
      setEdgeLabelBgColor(edge.labelBgStyle?.fill || "#ffffff");
      setEdgeLabelBgBorderRadius(parseInt(edge.labelBgStyle?.rx) || 2);
    }
  }, [edge]);

  if (!node && !edge) return null;

  // --- Node Handlers ---

  // Update label
  const handleLabelChange = (e) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    onUpdate(node.id, { label: newLabel });
  };

  // Update Parent ID
  const handleParentIdChange = (e) => {
    const newParentId = e.target.value;
    setParentId(newParentId);
  };

  const handleParentIdBlur = () => {
    if (parentId !== (node.parentId || "")) {
      if (window.confirm(translations.confirm_parent_change || "Are you sure you want to change the parent ID? This might move the node.")) {
        onUpdate(node.id, { parentId: parentId || null });
      } else {
        setParentId(node.parentId || "");
      }
    }
  };

  // Delete Node
  const handleDeleteNode = () => {
    if (window.confirm(translations.confirm_delete_node || "Are you sure you want to delete this node?")) {
      onDelete(node.id);
      onClose();
    }
  };

  // Update image source
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
        onUpdate(node.id, { src: data.url });
      } else {
        alert(translations.upload_failed);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  // Update color
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    onUpdate(node.id, { color: newColor });
  };

  // Assign random color
  const handleAssignRandomColor = () => {
    const newColor = generateRandomColor();
    onUpdate(node.id, { color: newColor });
  };

  // Remove color
  const handleRemoveColor = () => {
    onUpdate(node.id, { color: null });
  };

  // Toggle text color
  const handleToggleTextColor = () => {
    const newTextColor = node?.data?.textColor === "#000000" ? "#ffffff" : "#000000";
    onUpdate(node.id, { textColor: newTextColor });
  };

  // --- Edge Handlers ---

  const handleEdgeLabelChange = (e) => {
    const newLabel = e.target.value;
    setEdgeLabel(newLabel);
    onUpdateEdge(edge.id, { label: newLabel });
  };

  const handleEdgeTypeChange = (e) => {
    const newType = e.target.value;
    setEdgeType(newType);
    onUpdateEdge(edge.id, { type: newType });
  };

  const handleEdgeColorChange = (e) => {
    const newColor = e.target.value;
    setEdgeColor(newColor);
    onUpdateEdge(edge.id, { style: { ...edge.style, stroke: newColor } });
  };

  const handleEdgeWidthChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setEdgeWidth("");
      return;
    }
    const newWidth = parseInt(value);
    if (!isNaN(newWidth)) {
      setEdgeWidth(newWidth);
      onUpdateEdge(edge.id, { style: { ...edge.style, strokeWidth: newWidth } });
    }
  };

  const handleEdgeMarkerChange = (e) => {
    const isChecked = e.target.checked;
    setEdgeMarker(isChecked);
    onUpdateEdge(edge.id, { markerEnd: isChecked ? { type: 'arrowclosed', color: edgeColor } : undefined });
  };

  const handleEdgeAnimatedChange = (e) => {
    const isChecked = e.target.checked;
    setEdgeAnimated(isChecked);
    onUpdateEdge(edge.id, { animated: isChecked });
  };

  const handleEdgeLabelFontSizeChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setEdgeLabelFontSize("");
      return;
    }
    const newSize = parseInt(value);
    if (!isNaN(newSize)) {
      setEdgeLabelFontSize(newSize);
      onUpdateEdge(edge.id, { labelStyle: { ...edge.labelStyle, fontSize: newSize } });
    }
  };

  const handleEdgeLabelBgColorChange = (e) => {
    const newColor = e.target.value;
    setEdgeLabelBgColor(newColor);
    onUpdateEdge(edge.id, { labelBgStyle: { ...edge.labelBgStyle, fill: newColor } });
  };

  const handleEdgeLabelBgBorderRadiusChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setEdgeLabelBgBorderRadius("");
      return;
    }
    const newRadius = parseInt(value);
    if (!isNaN(newRadius)) {
      setEdgeLabelBgBorderRadius(newRadius);
      onUpdateEdge(edge.id, { labelBgStyle: { ...edge.labelBgStyle, rx: newRadius, ry: newRadius } });
    }
  };

  const handleDeleteEdge = () => {
    if (window.confirm("Are you sure you want to delete this edge?")) {
      onDeleteEdge(edge.id);
      onClose();
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{node ? translations.node_properties : "Edge Properties"}</h3>
        <button onClick={onClose} className={styles.closeButton}>✖</button>
      </div>

      <div className={styles.content}>
        {node && (
          <>
            <div className={styles.infoSection}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{translations.id}</span>
                <span className={styles.infoValue}>{node.id}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{translations.type}</span>
                <span className={styles.infoValue}>{node.type}</span>
              </div>
            </div>

            {/* Common field: Label */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{translations.label}</label>
              <input
                type="text"
                value={label}
                onChange={handleLabelChange}
                className={styles.input}
              />
            </div>

            {/* Parent ID Field */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{translations.parent_id || "Parent ID"}</label>
              <input
                type="text"
                value={parentId}
                onChange={handleParentIdChange}
                onBlur={handleParentIdBlur}
                placeholder="Enter Group ID"
                className={styles.input}
              />
            </div>

            {/* For imageNode: show image options */}
            {node.type === "imageNode" && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{translations.image_url}</label>
                  <input
                    type="text"
                    value={src}
                    onChange={handleSrcChange}
                    placeholder={translations.enter_image_url}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{translations.or_upload_image}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                  />
                </div>

                {src && (
                  <div className={styles.imagePreview}>
                    <img src={src} alt="Preview" className={styles.previewImage} />
                  </div>
                )}
              </>
            )}

            {/* For textNode, notesNode, and subflow: show color options */}
            {(node.type === "textNode" || node.type === "notesNode" || node.type === "subflow") && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{translations.background_color}</label>
                  <input
                    type="color"
                    value={rgbToHex(node?.data?.color) || "#ffffff"}
                    onChange={handleColorChange}
                    className={styles.colorInput}
                  />
                </div>

                <button onClick={handleAssignRandomColor} className={styles.button}>
                  🎨 {translations.assign_random_color}
                </button>

                <button onClick={handleRemoveColor} className={styles.buttonSecondary}>
                  🗑️ {translations.remove_color}
                </button>

                <div className={styles.formGroup}>
                  <label className={styles.label}>{translations.text_color}</label>
                  <button onClick={handleToggleTextColor} className={styles.toggleButton}>
                    {node?.data?.textColor === "#000000"
                      ? `⚪ ${translations.switch_to_white_text}`
                      : `⚫ ${translations.switch_to_black_text}`}
                  </button>
                </div>

                {node.type === "subflow" && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Label Font Size</label>
                    <input
                      type="number"
                      min="12"
                      max="100"
                      value={node?.data?.fontSize || 64}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          onUpdate(node.id, { fontSize: "" });
                          return;
                        }
                        const newSize = parseInt(val);
                        if (!isNaN(newSize)) {
                          onUpdate(node.id, { fontSize: newSize });
                        }
                      }}
                      className={styles.input}
                    />
                  </div>
                )}
              </>
            )}

            {/* Hide Handle Checkbox */}
            <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <label className={styles.label} style={{ marginBottom: 0 }}>{translations.hide_handles || "Hide Handles"}</label>
              <input
                type="checkbox"
                checked={node?.data?.hideHandle || false}
                onChange={(e) => onUpdate(node.id, { hideHandle: e.target.checked })}
                style={{ width: '20px', height: '20px' }}
              />
            </div>

            {/* Delete Node Button */}
            <div className={styles.separator} style={{ margin: '20px 0', borderTop: '1px solid #eee' }}></div>
            <button
              onClick={handleDeleteNode}
              className={styles.button}
              style={{ backgroundColor: '#ff4444', color: 'white' }}
            >
              🗑️ {translations.delete_node || "Delete Node"}
            </button>
          </>
        )}

        {edge && (
          <>
            <div className={styles.infoSection}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{translations.id}</span>
                <span className={styles.infoValue}>{edge.id}</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Label</label>
              <input
                type="text"
                value={edgeLabel}
                onChange={handleEdgeLabelChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Label Font Size</label>
              <input
                type="number"
                min="8"
                max="32"
                value={edgeLabelFontSize}
                onChange={handleEdgeLabelFontSizeChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Label Bg Color</label>
              <input
                type="color"
                value={edgeLabelBgColor}
                onChange={handleEdgeLabelBgColorChange}
                className={styles.colorInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Label Bg Radius</label>
              <input
                type="number"
                min="0"
                max="20"
                value={edgeLabelBgBorderRadius}
                onChange={handleEdgeLabelBgBorderRadiusChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Type</label>
              <select value={edgeType} onChange={handleEdgeTypeChange} className={styles.input}>
                <option value="default">Bezier (Default)</option>
                <option value="straight">Straight</option>
                <option value="step">Step</option>
                <option value="smoothstep">Smooth Step</option>
                <option value="simplebezier">Simple Bezier</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Color</label>
              <input
                type="color"
                value={edgeColor}
                onChange={handleEdgeColorChange}
                className={styles.colorInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Edge Width (px)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={edgeWidth}
                onChange={handleEdgeWidthChange}
                className={styles.input}
              />
            </div>

            <div ff={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className={styles.label} style={{ marginBottom: 0 }}>Arrow Marker</label>
              <input
                type="checkbox"
                checked={edgeMarker}
                onChange={handleEdgeMarkerChange}
                style={{ width: '20px', height: '20px' }}
              />
            </div>

            <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className={styles.label} style={{ marginBottom: 0 }}>Animated</label>
              <input
                type="checkbox"
                checked={edgeAnimated}
                onChange={handleEdgeAnimatedChange}
                style={{ width: '20px', height: '20px' }}
              />
            </div>

            <div className={styles.separator} style={{ margin: '20px 0', borderTop: '1px solid #eee' }}></div>
            <button
              onClick={handleDeleteEdge}
              className={styles.button}
              style={{ backgroundColor: '#ff4444', color: 'white' }}
            >
              🗑️ Delete Edge
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertySidebar;