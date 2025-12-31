import React, { useState, useEffect } from 'react';
import styles from '../CSS/SettingsModal.module.css';
import { useSettings } from '../context/SettingsContext';

const SettingsModal = ({ onClose }) => {
    const { handleSize, updateHandleSize, apiKey, updateApiKey } = useSettings();
    const [localApiKey, setLocalApiKey] = useState(apiKey);
    const [message, setMessage] = useState(null);

    const handleSave = () => {
        try {
            updateApiKey(localApiKey);
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Settings</h3>
                    <button onClick={onClose} className={styles.closeButton}>✖</button>
                </div>
                <div className={styles.content}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Gemini API Key</label>
                        <input
                            type="password"
                            value={localApiKey}
                            onChange={(e) => setLocalApiKey(e.target.value)}
                            placeholder="Enter your Gemini API Key"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Handle Size: {handleSize}px</label>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={handleSize}
                            onChange={(e) => updateHandleSize(parseInt(e.target.value))}
                            className={styles.slider}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <button onClick={handleSave} className={styles.saveButton}>
                        Save Settings
                    </button>
                    {message && (
                        <div className={`${styles.message} ${styles[message.type]}`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
