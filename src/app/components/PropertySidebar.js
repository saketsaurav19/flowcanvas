"use client";
import React, { useState, useEffect } from "react";
import translations from "../locales/en.json";
import { rgbToHex } from "../utils/colorUtils";
import { generateRandomColor } from "../utils/colorUtils";
import styles from "./PropertySidebar.module.css";

const PropertySidebar = ({ node, onClose, onUpdate }) => {
  const [label, setLabel] = useState(node?.data?.label || "");
  const [src, setSrc] = useState(node?.data?.src || "");

  // Update local states when the selected node changes
  useEffect(() => {
    setLabel(node?.data?.label || "");
    setSrc(node?.data?.src || "");
  }, [node]);

  if (!node) return null;

  // Update label
  const handleLabelChange = (e) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    onUpdate(node.id, { label: newLabel });
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{translations.node_properties}</h3>
        <button onClick={onClose} className={styles.closeButton}>✖</button>
      </div>

      <div className={styles.content}>
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
          </>
        )}
      </div>
    </div>
  );
};

export default PropertySidebar;