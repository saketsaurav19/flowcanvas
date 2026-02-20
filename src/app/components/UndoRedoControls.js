import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';

const UndoRedoControls = ({ onUndo, onRedo, canUndo, canRedo }) => {
    return (
        <div className="react-flow__controls" style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '0', position: 'static' }}>
            <button
                className="react-flow__controls-button"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                style={{ borderBottom: '1px solid #eee', borderRight: 'none' }}
            >
                <Undo2 size={16} />
            </button>
            <button
                className="react-flow__controls-button"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                style={{ borderRight: 'none' }}
            >
                <Redo2 size={16} />
            </button>
        </div>
    );
};

export default UndoRedoControls;
