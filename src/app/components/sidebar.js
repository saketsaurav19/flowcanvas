"use client";
import React from "react";
import translations from "../locales/en.json";
import SideCss from "../CSS/Sidebar.module.css";
import SaveRestorePanel from "./SaveRestorePanel";

const Sidebar = ({ onAddNode , onGroupNodes ,  reactFlowInstance, onLoadFlow }) => {
  return (
    <div className={SideCss.container}>
      <button
        onClick={() => onAddNode("textNode")}
        className={SideCss.buttons}
      >
       {translations.text_node}
      </button>
            
        <button
        onClick={() => onAddNode("imageNode")}
        className={SideCss.buttons}
      >
       {translations.image_node}
      </button>

      <button
        onClick={() => onAddNode("notesNode")}
        className={SideCss.buttons}
      >
       {translations.notes_node}
      </button>

      <button onClick={onGroupNodes} className={SideCss.buttons}>
       {translations.group_nodes}
      </button>

      <SaveRestorePanel
        reactFlowInstance={reactFlowInstance}
        onLoadFlow={onLoadFlow}
      />
    </div>
  );
};

export default Sidebar;
