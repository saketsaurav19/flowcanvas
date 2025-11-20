"use client";
import React from "react";
import translations from "../locales/en.json";
import styles from "./Sidebar.module.css";

const Sidebar = ({
    onAddNode,
    onGroupNodes,
    onSaveFlow,
    onLoadFlow,
    onBrowseExamples,
    onUploadFromDisk
}) => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>FlowCanvas</h3>
                <p className={styles.subtitle}>Node Editor</p>
            </div>

            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Add Nodes</h4>
                <button
                    onClick={() => onAddNode("textNode")}
                    className={styles.button}
                    title={translations.text_node}
                >
                    <span className={styles.icon}>📝</span>
                    <span className={styles.buttonText}>{translations.text_node}</span>
                </button>

                <button
                    onClick={() => onAddNode("imageNode")}
                    className={styles.button}
                    title={translations.image_node}
                >
                    <span className={styles.icon}>🖼️</span>
                    <span className={styles.buttonText}>{translations.image_node}</span>
                </button>

                <button
                    onClick={() => onAddNode("notesNode")}
                    className={styles.button}
                    title={translations.notes_node}
                >
                    <span className={styles.icon}>📋</span>
                    <span className={styles.buttonText}>{translations.notes_node}</span>
                </button>
            </div>

            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Operations</h4>
                <button onClick={onGroupNodes} className={styles.button} title={translations.group_nodes}>
                    <span className={styles.icon}>📦</span>
                    <span className={styles.buttonText}>{translations.group_nodes}</span>
                </button>
            </div>

            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>File Management</h4>
                <button onClick={onSaveFlow} className={styles.button} title="Save Flow">
                    <span className={styles.icon}>💾</span>
                    <span className={styles.buttonText}>Save Flow</span>
                </button>

                <label className={styles.button} style={{ cursor: 'pointer' }} title="Restore Flow">
                    <span className={styles.icon}>📂</span>
                    <span className={styles.buttonText}>Restore Flow</span>
                    <input
                        type="file"
                        accept="application/json"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
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
                            }
                        }}
                        style={{ display: 'none' }}
                    />
                </label>

                <button onClick={onBrowseExamples} className={styles.button} title="Browse Examples">
                    <span className={styles.icon}>🌟</span>
                    <span className={styles.buttonText}>Browse Examples</span>
                </button>

                <label className={styles.button} style={{ cursor: 'pointer' }} title="Upload Flow">
                    <span className={styles.icon}>⬆️</span>
                    <span className={styles.buttonText}>Upload Flow</span>
                    <input
                        type="file"
                        accept=".json"
                        onChange={onUploadFromDisk}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>
        </div>
    );
};

export default Sidebar;
