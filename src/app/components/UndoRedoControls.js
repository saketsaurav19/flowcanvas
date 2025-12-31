import React from 'react';
import styles from './UndoRedoControls.module.css';
import { Undo2, Redo2 } from 'lucide-react';

const UndoRedoControls = ({ onUndo, onRedo, canUndo, canRedo }) => {
    return (
        <div className={styles.container}>
            <button
                className={styles.button}
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Undo2 size={20} />
            </button>
            <button
                className={styles.button}
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Redo2 size={20} />
            </button>
        </div>
    );
};

export default UndoRedoControls;
