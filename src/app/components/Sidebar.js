"use client";
import React from "react";
import translations from "../locales/en.json";
import styles from "./Sidebar.module.css";
import {
    Type,
    Image as ImageIcon,
    StickyNote,
    Group,
    MousePointer2,
    Hand,
    Layout,
    Save,
    BookOpenCheck,
    Folder,
    BrainCircuit,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const Sidebar = ({
    onAddNode,
    onGroupNodes,
    onSaveFlow,

    onBrowseExamples,
    onUploadFromDisk,
    isSelectionMode,
    onToggleSelectionMode,
    onSettings,
    onGeminiAI,
    onLayout
}) => {
    const [isCollapsed, setIsCollapsed] = React.useState(true);
    const [position, setPosition] = React.useState({ x: 3, y: 5 });
    const [isDragging, setIsDragging] = React.useState(false);
    const dragStartRef = React.useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        if (e.target.closest(`.${styles.toggleButton}`)) return;
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const handleMouseMove = React.useCallback((e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStartRef.current.x,
                y: e.clientY - dragStartRef.current.y
            });
        }
    }, [isDragging]);

    const handleMouseUp = React.useCallback(() => {
        setIsDragging(false);
    }, []);

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}
            style={{ left: position.x, top: position.y }}
            onMouseDown={handleMouseDown}
        >
            <button
                className={styles.toggleButton}
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? "Expand" : "Collapse"}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            <div className={styles.scrollContainer}>
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
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <span className={styles.icon} style={{ display: 'flex' }}><Type size={20} /></span>
                        <span className={styles.buttonText}>{translations.text_node}</span>
                    </button>

                    <button
                        onClick={() => onAddNode("imageNode")}
                        className={styles.button}
                        title={translations.image_node}
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <span className={styles.icon} style={{ display: 'flex' }}><ImageIcon size={20} /></span>
                        <span className={styles.buttonText}>{translations.image_node}</span>
                    </button>

                    <button
                        onClick={() => onAddNode("notesNode")}
                        className={styles.button}
                        title={translations.notes_node}
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <span className={styles.icon} style={{ display: 'flex' }}><StickyNote size={20} /></span>
                        <span className={styles.buttonText}>{translations.notes_node}</span>
                    </button>
                </div>

                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Operations</h4>
                    <button onClick={onGroupNodes} className={styles.button} title={translations.group_nodes} style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={styles.icon} style={{ display: 'flex' }}><Group size={20} /></span>
                        <span className={styles.buttonText}>{translations.group_nodes}</span>
                    </button>
                    <button
                        onClick={onToggleSelectionMode}
                        className={`${styles.button} ${isSelectionMode ? styles.active : ''}`}
                        title={isSelectionMode ? "Switch to Pan Mode" : "Switch to Selection Mode"}
                        style={{ backgroundColor: isSelectionMode ? '#e2e8f0' : undefined, display: 'flex', alignItems: 'center' }}
                    >
                        <span className={styles.icon} style={{ display: 'flex' }}>{isSelectionMode ? <Hand size={20} /> : <MousePointer2 size={20} />}</span>
                        <span className={styles.buttonText}>{isSelectionMode ? "Pan Mode" : "Select Mode"}</span>
                    </button>
                    <button onClick={onLayout} className={styles.button} title="Auto Layout" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={styles.icon} style={{ display: 'flex' }}><Layout size={20} /></span>
                        <span className={styles.buttonText}>Auto Layout</span>
                    </button>
                </div>

                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>File Management</h4>
                    <button onClick={onSaveFlow} className={styles.button} title="Save Flow" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={styles.icon} style={{ display: 'flex' }}><Save size={20} /></span>
                        <span className={styles.buttonText}>Save Flow</span>
                    </button>



                    <button onClick={onBrowseExamples} className={styles.button} title="Browse Examples" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={styles.icon} style={{ display: 'flex' }}><BookOpenCheck size={20} /></span>
                        <span className={styles.buttonText}>Browse Examples</span>
                    </button>

                    <label className={styles.button} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Upload Flow">
                        <span className={styles.icon} style={{ display: 'flex' }}><Folder size={20} /></span>
                        <span className={styles.buttonText}>Upload Flow</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={onUploadFromDisk}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>

                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>AI & Settings</h4>
                    <button onClick={onGeminiAI} className={styles.button} title="Gemini AI" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={styles.icon} style={{ display: 'flex' }}><BrainCircuit size={20} /></span>
                        <span className={styles.buttonText}>Gemini AI</span>
                    </button>
                    <button onClick={onSettings} className={styles.button} title="Settings" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={styles.icon} style={{ display: 'flex' }}><Settings size={20} /></span>
                        <span className={styles.buttonText}>Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
