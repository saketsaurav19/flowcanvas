// SaveRestorePanel.js
import React from "react";
import SideCss from "../CSS/Sidebar.module.css";
import translations from "../locales/en.json";


const SaveRestorePanel = ({ reactFlowInstance, onLoadFlow }) => {
  // Download JSON file
  const handleSave = () => {
    if (!reactFlowInstance) return;
    const flow = reactFlowInstance.toObject();
    const json = JSON.stringify(flow, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "flow-data.json";
    link.click();
  };

  // Upload JSON file
  const handleRestore = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const flow = JSON.parse(event.target.result);
        onLoadFlow(flow, file.name);
      } catch (err) {
        alert(translations.invalid_json_file);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <button onClick={handleSave} className={SideCss.buttons}>{translations.save_flow}</button>
      <label
        className={SideCss.buttons}
      >
        {translations.restore_flow}
        <input
          type="file"
          accept="application/json"
          onChange={handleRestore}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
};

export default SaveRestorePanel;
